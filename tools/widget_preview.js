// Preview the actual Scriptable layout and DrawContext paths. WidgetKit remains the device authority.
const U = require('../scriptable/core.js');
let previewNow = Date.now();
const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colorCSS = c => '#' + (c?.hex || '222');
class Element {
  constructor(kind = 'stack') { this.kind = kind; this.children = []; this.direction = kind === 'widget' ? 'column' : 'row'; }
  addStack() { const e = new Element(); this.children.push(e); return e; }
  addText(value) { const e = new Element('text'); e.text = value; this.children.push(e); return e; }
  addDate(value) { const e = this.addText(U.ageText(value.toISOString(), previewNow)); e.date = value; return e; }
  addImage(value) { const e = new Element('image'); e.image = value; this.children.push(e); return e; }
  addSpacer(value) { const e = new Element('space'); e.value = value; this.children.push(e); }
  setPadding(...values) { this.padding = values; }
  layoutHorizontally() { this.direction = 'row'; }
  layoutVertically() { this.direction = 'column'; }
  centerAlignContent() { this.center = true; }
  centerAlignImage() {} applyRelativeStyle() {} applyFittingContentMode() {} leftAlignImage() {}
}
class DrawContext {
  constructor() { this.shapes = []; this.paths = []; }
  setStrokeColor(c) { this.stroke = c; } setFillColor(c) { this.fill = c; }
  setLineWidth(w) { this.lineWidth = w; } addPath(p) { this.paths.push(p); }
  setTextColor(c) { this.textColor = c; } setTextAlignedCenter() { this.textAlignment = 'middle'; }
  setFont(font) { this.font = font; }
  drawTextInRect(value, rect) {
    const x = this.textAlignment === 'middle' ? rect.x + rect.width / 2 : rect.x;
    this.shapes.push('<text data-drawn-text data-rect="' + [rect.x,rect.y,rect.width,rect.height].join(',') + '" x="' + x + '" y="' + (rect.y + this.font.size * .98) + '" text-anchor="' + (this.textAlignment || 'start') + '" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="' + this.font.size + '" font-weight="' + this.font.weight + '" fill="' + colorCSS(this.textColor) + '">' + esc(value) + '</text>');
  }
  strokePath() {
    this.shapes.push(...this.paths.map(p => '<path d="' + p.commands.join(' ') + '" fill="none" stroke="' + colorCSS(this.stroke) + '" stroke-opacity="' + (this.stroke?.opacity ?? 1) + '" stroke-width="' + this.lineWidth + '"/>'));
    this.paths = [];
  }
  fillRect(r) { this.shapes.push('<rect x="' + r.x + '" y="' + r.y + '" width="' + r.width + '" height="' + r.height + '" fill="' + colorCSS(this.fill) + '"/>'); }
  fillEllipse(r) { this.shapes.push('<ellipse cx="' + (r.x + r.width / 2) + '" cy="' + (r.y + r.height / 2) + '" rx="' + r.width / 2 + '" ry="' + r.height / 2 + '" fill="' + colorCSS(this.fill) + '"/>'); }
  getImage() { return { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="' + this.size.width + '" height="' + this.size.height + '" viewBox="0 0 ' + this.size.width + ' ' + this.size.height + '">' + this.shapes.join('') + '</svg>' }; }
}
function render(e, parentDirection = 'column') {
  let css = 'min-width:0;box-sizing:border-box;';
  if (e.kind === 'space') return '<div style="' + (e.value == null ? 'flex:1;min-height:0' : 'flex:none;' + (parentDirection === 'column' ? 'height:' : 'width:') + e.value + 'px') + '"></div>';
  if (e.size?.width) css += 'width:' + e.size.width + 'px;flex-shrink:0;';
  if (e.size?.height) css += 'height:' + e.size.height + 'px;flex-shrink:0;';
  if (e.padding) css += 'padding:' + e.padding.map(v => v + 'px').join(' ') + ';';
  if (e.backgroundColor) css += 'background-color:' + colorCSS(e.backgroundColor) + ';';
  if (e.backgroundImage?.svg) css += 'background-image:url(&quot;data:image/svg+xml,' + encodeURIComponent(e.backgroundImage.svg) + '&quot;);background-size:100% 100%;background-repeat:no-repeat;';
  if (e.kind === 'text') {
    css += 'font-size:' + e.font.size + 'px;font-weight:' + e.font.weight + ';color:' + colorCSS(e.textColor) + ';line-height:1.2;flex-shrink:' + (parentDirection === 'column' ? 0 : 1) + ';';
    if (e.lineLimit === 1) css += 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    else if (e.lineLimit) css += 'display:-webkit-box;-webkit-line-clamp:' + e.lineLimit + ';-webkit-box-orient:vertical;overflow:hidden;';
    return '<span data-native-text style="' + css + '">' + esc(e.text) + '</span>';
  }
  if (e.kind === 'image') return '<div data-native-chart style="' + css + 'flex:none;width:' + e.imageSize.width + 'px;height:' + e.imageSize.height + 'px">' + (e.image?.svg || '') + '</div>';
  css += 'display:flex;flex-direction:' + e.direction + ';' + (e.center ? 'align-items:center;' : '');
  if (e.kind === 'widget') css += 'width:100%;height:100%;';
  return '<div' + (e.backgroundImage ? ' data-native-chart' : '') + ' style="' + css + '">' + e.children.map(child => render(child, e.direction)).join('') + '</div>';
}
function widgetHTML(snapshot, now, screenWidth = 440, dark = false) {
  previewNow = now;
  global.ListWidget = class extends Element { constructor() { super('widget'); } };
  global.Color = class { constructor(hex, opacity = 1) { this.hex = hex; this.opacity = opacity; } };
  global.Size = class { constructor(width, height) { this.width = width; this.height = height; } };
  global.Point = class { constructor(x, y) { this.x = x; this.y = y; } };
  global.Rect = class { constructor(x, y, width, height) { Object.assign(this, {x, y, width, height}); } };
  global.Path = class { constructor() { this.commands = []; } move(p) { this.commands.push('M' + p.x + ',' + p.y); } addLine(p) { this.commands.push('L' + p.x + ',' + p.y); } };
  global.DrawContext = DrawContext;
  global.Font = { systemFont: size => ({size,weight:400}), mediumSystemFont: size => ({size,weight:500}), boldSystemFont: size => ({size,weight:700}), semiboldSystemFont: size => ({size,weight:600}) };
  global.Device = { isUsingDarkAppearance: () => dark, screenSize: () => ({width:screenWidth,height:956}) };
  const widget = U.createWidget(snapshot, U.parseOptions('codex'), 'large', {}, now);
  return render(widget);
}
module.exports = { widgetHTML };
