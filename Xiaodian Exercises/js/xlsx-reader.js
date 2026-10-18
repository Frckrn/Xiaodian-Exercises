/**
 * A small, dependency-free .xlsx reader.
 * It opens the Office Open XML zip container, reads the first worksheet and
 * turns its cells into plain strings. Only the data needed by the question
 * importer is extracted; styles, images and charts are ignored.
 */
(function (global) {
  "use strict";

  class XlsxReadError extends Error {
    constructor(message) {
      super(message);
      this.name = "XlsxReadError";
    }
  }

  const MAX_FILE_BYTES = 20 * 1024 * 1024;
  const MAX_ENTRY_BYTES = 50 * 1024 * 1024;
  const utf8 = new TextDecoder("utf-8");

  function fail(message) {
    throw new XlsxReadError(message);
  }

  function readU16(view, offset) {
    return view.getUint16(offset, true);
  }

  function readU32(view, offset) {
    return view.getUint32(offset, true);
  }

  function findEndOfCentralDirectory(bytes, view) {
    const min = Math.max(0, bytes.length - 22 - 65535);
    for (let offset = bytes.length - 22; offset >= min; offset -= 1) {
      if (readU32(view, offset) === 0x06054b50) return offset;
    }
    return -1;
  }

  function parseZipDirectory(bytes) {
    if (!bytes || bytes.length < 22) {
      fail("文件内容为空或格式不完整。");
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (readU32(view, 0) === 0xd0cf11e0) {
      fail("这是旧版 .xls 文件。请在 Excel 中另存为 .xlsx 后再导入。");
    }
    if (readU32(view, 0) !== 0x04034b50) {
      fail("无法识别该文件，请确认它是有效的 .xlsx 文件。");
    }

    const eocd = findEndOfCentralDirectory(bytes, view);
    if (eocd < 0) fail("压缩结构不完整，文件可能已损坏。");

    const entryCount = readU16(view, eocd + 10);
    const directorySize = readU32(view, eocd + 12);
    const directoryOffset = readU32(view, eocd + 16);
    if (directoryOffset === 0xffffffff || directorySize === 0xffffffff) {
      fail("暂不支持过大的 ZIP64 工作簿，请拆分题库后重试。");
    }

    const entries = new Map();
    let cursor = directoryOffset;
    for (let i = 0; i < entryCount; i += 1) {
      if (cursor + 46 > bytes.length || readU32(view, cursor) !== 0x02014b50) {
        fail("工作簿目录损坏，无法读取。");
      }

      const flags = readU16(view, cursor + 8);
      const method = readU16(view, cursor + 10);
      const compressedSize = readU32(view, cursor + 20);
      const uncompressedSize = readU32(view, cursor + 24);
      const nameLength = readU16(view, cursor + 28);
      const extraLength = readU16(view, cursor + 30);
      const commentLength = readU16(view, cursor + 32);
      const localOffset = readU32(view, cursor + 42);
      const nameStart = cursor + 46;
      const nameEnd = nameStart + nameLength;
      if (nameEnd > bytes.length) fail("工作簿文件名信息损坏。");

      const name = utf8.decode(bytes.subarray(nameStart, nameEnd)).replace(/^\/+/, "");
      entries.set(name, {
        name,
        flags,
        method,
        compressedSize,
        uncompressedSize,
        localOffset,
      });
      cursor = nameEnd + extraLength + commentLength;
    }
    return entries;
  }

  async function inflateRaw(compressed) {
    if (!compressed.length) return new Uint8Array(0);
    if (typeof DecompressionStream === "undefined") {
      fail("当前浏览器不支持解压 Excel 文件，请使用最新版 Edge、Chrome 或 Firefox。");
    }
    try {
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch (error) {
      fail("读取工作簿时解压失败，请尝试在 Excel 中重新保存后再导入。");
    }
  }

  async function extractEntry(bytes, view, entry) {
    if (!entry) return null;
    if (entry.flags & 0x1) fail("暂不支持加密的 Excel 文件，请取消密码后重试。");
    if (entry.uncompressedSize > MAX_ENTRY_BYTES) {
      fail("工作簿中的工作表过大，请精简题库后再导入。");
    }
    if (entry.localOffset + 30 > bytes.length || readU32(view, entry.localOffset) !== 0x04034b50) {
      fail("无法定位工作簿中的数据。");
    }

    const nameLength = readU16(view, entry.localOffset + 26);
    const extraLength = readU16(view, entry.localOffset + 28);
    const dataStart = entry.localOffset + 30 + nameLength + extraLength;
    const dataEnd = dataStart + entry.compressedSize;
    if (dataEnd > bytes.length) fail("工作簿数据不完整。");

    const compressed = bytes.subarray(dataStart, dataEnd);
    let data;
    if (entry.method === 0) {
      data = compressed;
    } else if (entry.method === 8) {
      data = await inflateRaw(compressed);
    } else {
      fail("工作簿使用了暂不支持的压缩格式，请用 Excel 重新保存。");
    }

    if (entry.uncompressedSize && data.length !== entry.uncompressedSize) {
      fail("工作簿数据校验未通过，请重新保存后再试。");
    }
    return data;
  }

  function decodeXml(data) {
    return utf8.decode(data).replace(/^\uFEFF/, "");
  }

  function parseXml(text, label) {
    const doc = new DOMParser().parseFromString(text, "application/xml");
    if (doc.getElementsByTagName("parsererror").length) {
      fail(`${label || "工作簿"}的 XML 内容无法解析。`);
    }
    return doc;
  }

  function tags(root, localName) {
    if (!root) return [];
    return Array.from(root.getElementsByTagNameNS("*", localName));
  }

  function resolveZipPath(baseDir, target) {
    if (!target) return "";
    if (target.startsWith("/")) return target.replace(/^\/+/, "");
    const parts = `${baseDir}/${target}`.split("/");
    const stack = [];
    for (const part of parts) {
      if (!part || part === ".") continue;
      if (part === "..") stack.pop();
      else stack.push(part);
    }
    return stack.join("/");
  }

  function findEntry(entries, path) {
    if (entries.has(path)) return path;
    const lower = path.toLowerCase();
    for (const key of entries.keys()) {
      if (key.toLowerCase() === lower) return key;
    }
    return null;
  }

  function getRelationshipId(element) {
    for (const attr of Array.from(element.attributes || [])) {
      if (attr.localName === "id" && /relationships/i.test(attr.namespaceURI || "")) {
        return attr.value;
      }
    }
    return element.getAttribute("r:id") || element.getAttribute("id") || "";
  }

  function collectText(element) {
    if (!element) return "";
    return tags(element, "t")
      .filter((node) => {
        let parent = node.parentNode;
        while (parent && parent !== element.parentNode) {
          if (parent.localName === "rPh") return false;
          parent = parent.parentNode;
        }
        return true;
      })
      .map((node) => node.textContent || "")
      .join("");
  }

  function columnIndex(reference) {
    const match = /^([A-Z]+)/i.exec(reference || "");
    if (!match) return -1;
    let value = 0;
    for (const char of match[1].toUpperCase()) {
      value = value * 26 + (char.charCodeAt(0) - 64);
    }
    return value - 1;
  }

  function parseSharedStrings(xml) {
    if (!xml) return [];
    const doc = parseXml(xml, "共享字符串表");
    return tags(doc, "si").map((node) => collectText(node));
  }

  function parseWorksheet(xml, sharedStrings) {
    const doc = parseXml(xml, "工作表");
    const sheetData = tags(doc, "sheetData")[0];
    if (!sheetData) fail("工作表内没有可读取的数据。");

    const rows = [];
    const rowElements = tags(sheetData, "row");
    for (const rowElement of rowElements) {
      const rowNumber = Number(rowElement.getAttribute("r")) || rows.length + 1;
      const cells = [];
      let nextColumn = 0;

      for (const cell of tags(rowElement, "c")) {
        const ref = cell.getAttribute("r") || "";
        let index = ref ? columnIndex(ref) : nextColumn;
        if (index < 0 || index > 1000) index = nextColumn;
        nextColumn = index + 1;

        const type = cell.getAttribute("t") || "";
        let value = "";
        if (type === "inlineStr") {
          const inline = tags(cell, "is")[0];
          value = collectText(inline);
        } else {
          const valueNode = tags(cell, "v")[0];
          const raw = valueNode ? valueNode.textContent || "" : "";
          if (type === "s") {
            const sharedIndex = Number(raw);
            value = Number.isInteger(sharedIndex) ? sharedStrings[sharedIndex] || "" : "";
          } else if (type === "b") {
            value = raw === "1" ? "TRUE" : "FALSE";
          } else {
            value = raw;
          }
        }
        cells[index] = String(value);
      }

      if (cells.some((value) => String(value || "").trim() !== "")) {
        while (cells.length && String(cells[cells.length - 1] || "").trim() === "") cells.pop();
        rows.push({ number: rowNumber, cells });
      }
    }
    return rows;
  }

  async function readFile(file) {
    if (!file) fail("请选择一个 Excel 文件。");
    if (!/\.xlsx$/i.test(file.name || "")) {
      fail("目前支持 .xlsx 格式。若文件是 .xls，请在 Excel 中另存为 .xlsx。");
    }
    if (file.size > MAX_FILE_BYTES) {
      fail("文件超过 20MB，请精简题库后再导入。");
    }

    let bytes;
    try {
      bytes = new Uint8Array(await file.arrayBuffer());
    } catch (error) {
      fail("无法读取该文件，请重试。");
    }
    if (!bytes.length) fail("文件内容为空。");

    const entries = parseZipDirectory(bytes);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    const workbookPath = findEntry(entries, "xl/workbook.xml");
    if (!workbookPath) fail("未找到 Excel 工作簿内容，请确认文件没有被改名或损坏。");

    const workbookXml = decodeXml(await extractEntry(bytes, view, entries.get(workbookPath)));
    const workbookDoc = parseXml(workbookXml, "工作簿");
    const sheetNodes = tags(workbookDoc, "sheet");
    if (!sheetNodes.length) fail("工作簿中没有工作表。");

    const firstSheet = sheetNodes[0];
    const sheetName = firstSheet.getAttribute("name") || "题库";
    const relationshipId = getRelationshipId(firstSheet);

    let sheetPath = "";
    const relsPath = findEntry(entries, "xl/_rels/workbook.xml.rels");
    if (relsPath) {
      const relsXml = decodeXml(await extractEntry(bytes, view, entries.get(relsPath)));
      const relsDoc = parseXml(relsXml, "工作簿关系");
      for (const relationship of tags(relsDoc, "Relationship")) {
        if (relationship.getAttribute("Id") === relationshipId) {
          sheetPath = resolveZipPath("xl", relationship.getAttribute("Target") || "");
          break;
        }
      }
    }
    if (!sheetPath || !entries.has(sheetPath)) {
      sheetPath = Array.from(entries.keys())
        .filter((name) => /^xl\/worksheets\/[^/]+\.xml$/i.test(name))
        .sort()[0] || "";
    }
    if (!sheetPath) fail("未找到可读取的工作表。");

    const sharedPath = findEntry(entries, "xl/sharedStrings.xml");
    const sharedStrings = sharedPath
      ? parseSharedStrings(decodeXml(await extractEntry(bytes, view, entries.get(sharedPath))))
      : [];
    const sheetXml = decodeXml(await extractEntry(bytes, view, entries.get(sheetPath)));
    const rows = parseWorksheet(sheetXml, sharedStrings);

    return {
      sheetName,
      sheetNames: sheetNodes.map((node) => node.getAttribute("name") || "未命名工作表"),
      rows,
    };
  }

  global.XlsxReader = Object.freeze({ readFile, XlsxReadError });
})(window);
