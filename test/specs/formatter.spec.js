"use strict";

require("@babel/polyfill/noConflict");
const { ono, Ono } = require("../../");
const { expect } = require("chai");
const { comparePOJO } = require("../utils");

// NOTE: The default formatter is already tested in ono.spec.js
describe("ono.formatter", function () {
  let originalFormatter;

  before(function () {
    originalFormatter = ono.formatter;

    // A simple formatter that replaces $0, $1, $2, etc. with the corresponding param
    ono.formatter = function (message) {
      let params = Array.prototype.slice.call(arguments, 1);
      return params.reduce(function (msg, param, index) {
        return msg.replace("$" + index, param);
      }, message);
    };
  });

  after(function () {
    ono.formatter = originalFormatter;
  });

  it("should use a custom formatter", () => {
    let err = ono("$0 must be greater than $1", 4, 10);

    expect(err).to.be.an.instanceOf(Error);
    expect(err.name).to.equal("Error");
    expect(err.message).to.equal("4 must be greater than 10");

    let json = JSON.parse(JSON.stringify(err));
    expect(json).to.satisfy(comparePOJO({
      name: err.name,
      message: err.message,
      stack: err.stack
    }));
  });

  it("should use a custom formatter for type-specific methods", () => {
    let err = ono.type("$0 must be greater than $1", 4, 10);

    expect(err).to.be.an.instanceOf(TypeError);
    expect(err.name).to.equal("TypeError");
    expect(err.message).to.equal("4 must be greater than 10");

    let json = JSON.parse(JSON.stringify(err));
    expect(json).to.satisfy(comparePOJO({
      name: err.name,
      message: err.message,
      stack: err.stack
    }));
  });

  it("should use a custom formatter for custom Ono methods", () => {
    class MyCustomErrorClass extends Error {
      constructor () {
        super("This is my custom error message");
        this.name = "MyCustomErrorClass";
        this.code = 12345;
      }
    }

    let myCustomOno = new Ono(MyCustomErrorClass);

    let err = myCustomOno("$0 must be greater than $1", 4, 10);

    expect(err).to.be.an.instanceOf(MyCustomErrorClass);
    expect(err.name).to.equal("MyCustomErrorClass");
    expect(err.message).to.equal("This is my custom error message");

    let json = JSON.parse(JSON.stringify(err));
    expect(json).to.satisfy(comparePOJO({
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: 12345,
    }));
  });

});
