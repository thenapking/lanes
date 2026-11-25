let svg_export_requested = false;

function request_svg_export() {
  svg_export_requested = true;
}

function begin_svg_export() {
  if (!svg_export_requested) return false;

  svg_export_requested = false;
  beginRecordSvg("lanes.svg");
  return true;
}

function end_svg_export(recording) {
  if (recording) {
    endRecordSvg();
  }
}
