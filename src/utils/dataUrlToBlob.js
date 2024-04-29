function dataUrlToBlob(strUrl) {
  var parts = strUrl.split(/[:;,]/),
    type = parts[1],
    decoder = parts[2] == "base64" ? atob : decodeURIComponent,
    binData = decoder(parts.pop()),
    mx = binData.length,
    i = 0,
    uiArr = new Uint8Array(mx);

  for (i; i < mx; ++i) uiArr[i] = binData.charCodeAt(i);

  return new Blob([uiArr], { type: type });
}

export default dataUrlToBlob;
