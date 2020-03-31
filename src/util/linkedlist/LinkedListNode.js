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

const ListElement = require('./ListElement');

module.exports = class LinkedListNode extends ListElement {

    constructor(nextElement, data) {
        super(); 
        this.nextElement = nextElement;
        this.data = data;  
    }

    append(data) {
        this.nextElement = this.nextElement.append(data); 
        return this; 
    }

    getElement(index) {
        index--; 
        if(index != 0) {
            return this.nextElement.getElement(index); 
        } else {
            return this.data; 
        }
    }

    getLength() {
        return 1 + this.nextElement.getLength(); 
    }

    removeElement(index) {
        index--; 
        if(index != 0) {
            this.nextElement = this.nextElement.removeElement(index); 
            return this; 
        } else {
            return this.nextElement; 
        }
    }
}