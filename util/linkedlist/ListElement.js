// MIT License

// Copyright (c) 2020 Johannes Bonk

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

module.exports = class ListElement {
    constructor() {
      if (new.target === ListElement) {
        throw new TypeError("Cant create ListElement direclty, use derived classes");
      }

      if (this.append === undefined) {
        throw new TypeError("Method *append(data)* has to be implemented");
      }

      if (this.getElement === undefined) {
        throw new TypeError("Method *getElement(index)* has to be implemented");
      }

      if (this.getLength === undefined) {
        throw new TypeError("Method *getLength(index)* has to be implemented");
      }

      if (this.removeElement === undefined) {
        throw new TypeError("Method *removeElement(index)* has to be implemented");
      }
    }

    append(data) {}

    getElement(index) {}

    getLength() {}

    removeElement(index) {}

  }