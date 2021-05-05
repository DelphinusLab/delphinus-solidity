function append_info(c) {
  let ele = document.createElement("p");
  ele.appendChild(document.createTextNode(c));
  document.body.appendChild(ele);
}

module.exports = {
  info: append_info,
}
