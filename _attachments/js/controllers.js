'use strict';

/**
 * Creates and returns a blob from a data URL (either base64 encoded or not).
 *
 * @param {string} dataURL The data URL to convert.
 * @return {Blob} A blob representing the array buffer data.
 */
function dataURLToBlob(dataURL) {
  console.log(dataURL);
  var BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(',');
    var contentType = parts[0].split(':')[1];
    var raw = decodeURIComponent(parts[1]);

    return new Blob([raw], {
      type: contentType
    });
  }

  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(':')[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], {
    type: contentType
  });
}

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', 'cornercouch',
    function ($scope, cornercouch) {
      $scope.server = cornercouch();
      $scope.server.session();
      $scope.camdb = $scope.server.getDB('cam');
      $scope.camdb.query("cam", "studies", {
        include_docs: true
      })
  }])
  .controller('MyCtrl2', ['$scope', 'cornercouch', '$http',
    function ($scope, cornercouch, $http) {

      $scope.server = cornercouch();
      $scope.server.session();
      $scope.camdb = $scope.server.getDB('cam');
      $scope.newentry = $scope.camdb.newDoc({
        type: "imagingStudy",
        dateTime: new Date(),
        accessionNo: "U" + Math.floor(Math.random() * 100) + "-" + Math.floor(Math.random() * 100000)
      });
      console.log($scope.newentry);
      $scope.newentry.save();
      console.log($scope.newentry);

      $scope.updateAccessionNo = function () {
        $scope.newentry.save()
      }

      $scope.capturePhoto = function (media) {
        if (media) {
          console.log(media);
          $scope.mySnapshot = media;
          $scope.$apply();

          var newFileNum = 1;
          if ($scope.newentry._attachments) {
            newFileNum = Object.keys($scope.newentry._attachments).length + 1;
          }
          console.log(newFileNum);

          var mediaBinary = dataURLToBlob(media);
          console.log(mediaBinary);

          $http.put('/cam/' + $scope.newentry._id + '/' + newFileNum + '.jpg?rev=' + $scope.newentry._rev, mediaBinary, {
            headers: {
              "Content-Type": mediaBinary.type
            }
          }).success(function (data, status) {
            console.log(status);
            console.log(data);
            $scope.newentry = $scope.camdb.getDoc($scope.newentry._id);
          }).error(function (data, status) {
            console.log(status);
            console.log(data);
          });
        } else {
          throw new Error("No media!");
        }
      };
  }]);