/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */
self.imageData = null;

self.dataAtPoint = function (x, y, deferredId) {
    if (!self.imageData) {
        throw "Worker has no ImageData to find data at point (" + x + "," + y + ")";
    }

    var width = self.imageData.width,
        height = self.imageData.height,
        index,
        data,
        pixel;

    if (x < 0) {
        x = 0;
    }

    if (y < 0) {
        y = 0;
    }

    if (x >= width) {
        x = width - 1;
    }

    if (y >= height) {
        y = height - 1;
    }

    data = self.imageData.data;
    index = (y * width + x) * 4
    pixel =[
        data[index + 0],
        data[index + 1],
        data[index + 2],
        data[index + 3]
    ];

    postMessage({"command": "dataAtPoint", "x": x, "y": y, "color": pixel, "deferredId": deferredId});
};

self.onmessage = function(evt) {

    var data = evt.data;

    if ("dataAtPoint" === data.command) {
        self.dataAtPoint(data.x, data.y, data.deferredId);
    } else if ("imageData" === data.command) {
        self.imageData = data.imageData;
    }
};
