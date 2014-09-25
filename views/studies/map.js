function (doc) {
  if (doc.type == "imagingStudy") {
    emit(doc.dateTime, doc);
  }
}
