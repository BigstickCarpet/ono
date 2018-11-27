(function () {
  'use strict';

  // Errors in IE 11 and older do not include stack traces at all.
  // Safari stack traces have the script URL and line number, but no function name
  var STACK_TRACES_HAVE_FUNCTION_NAMES = !host.browser.safari && !(host.browser.IE && host.browser.IE.version < 12);

  helper.forEachMethod(function (name, ono, ErrorType, ErrorTypeName) {
    // Node.js and Chrome both have V8 stack traces, which start with the error name and message
    var STACK_TRACE_INCLUDES_ERROR_NAME_AND_MESSAGE = host.node || host.browser.chrome;

    var factoryName = ono.name || 'onoFactory';

    describe(name, function () {

      it('can be called without any args',
        function () {
          function newErrorWithNoArgs () {
            return ono();
          }

          var err = newErrorWithNoArgs();

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('');

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithNoArgs/);
            }
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack
          }));
        }
      );

      it('can be called with just a message',
        function () {
          function newErrorWithMessage () {
            return ono('Onoes!!!');
          }

          var err = newErrorWithMessage();

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Onoes!!!');

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithMessage/);
            }
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack
          }));
        }
      );

      it('can be called with a parameterized message',
        function () {
          function newErrorWithParams () {
            return ono('Testing %s, %d, %j', 1, '2', '3');
          }

          var err = newErrorWithParams();

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Testing 1, 2, "3"');

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithParams/);
            }
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack
          }));
        }
      );

      it('can be called with parameters, even if the message has no placeholders',
        function () {
          function newErrorWithNoPlaceholders () {
            return ono('Testing', 1, '2', '3');
          }

          var err = newErrorWithNoPlaceholders();

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Testing 1 2 3');

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithNoPlaceholders/);
            }
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack
          }));
        }
      );

      it('can be called without parameters, even if the message has placeholders',
        function () {
          function newErrorWithNoParams () {
            return ono('Testing %s, %d, %j');
          }

          var err = newErrorWithNoParams();

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Testing %s, %d, %j');

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithNoParams/);
            }
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack
          }));
        }
      );

      it('can be called with just an inner error',
        function () {
          function makeInnerError () {
            var innerError = new SyntaxError('This is the inner error');
            innerError.foo = 'bar';
            innerError.code = 404;
            return innerError;
          }

          function newErrorWithInnerError (innerErr) {
            return ono(innerErr);
          }

          var err = newErrorWithInnerError(makeInnerError());

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('This is the inner error');
          expect(err.foo).to.equal('bar');
          expect(err.code).to.equal(404);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithInnerError/);
              expect(err.stack).to.match(/makeInnerError/);
            }
          }

          if (STACK_TRACE_INCLUDES_ERROR_NAME_AND_MESSAGE) {
            expect(err.stack).to.match(/SyntaxError: This is the inner error/);
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            foo: 'bar',
            code: 404
          }));
        }
      );

      it('can be called with an inner error and a message',
        function () {
          function makeInnerError () {
            var innerError = new ReferenceError('This is the inner error');
            innerError.foo = 'bar';
            innerError.code = 404;
            return innerError;
          }

          function newErrorWithInnerErrorAndMessage (innerErr) {
            return ono(innerErr, 'Oops, an error happened.');
          }

          var err = newErrorWithInnerErrorAndMessage(makeInnerError());

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Oops, an error happened. \nThis is the inner error');
          expect(err.foo).to.equal('bar');
          expect(err.code).to.equal(404);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithInnerErrorAndMessage/);
              expect(err.stack).to.match(/makeInnerError/);
            }
          }

          if (STACK_TRACE_INCLUDES_ERROR_NAME_AND_MESSAGE) {
            expect(err.stack).to.match(/ReferenceError: This is the inner error/);
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            foo: 'bar',
            code: 404
          }));
        }
      );

      it('can be called with an inner error and a parameterized message',
        function () {
          function makeInnerError () {
            var innerError = new RangeError('This is the inner error');
            innerError.foo = 'bar';
            innerError.code = 404;
            return innerError;
          }

          function newErrorWithInnerErrorAndParamMessage (innerErr) {
            return ono(innerErr, 'Testing, %s, %d, %j', 1, '2', '3');
          }

          var err = newErrorWithInnerErrorAndParamMessage(makeInnerError());

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Testing, 1, 2, "3" \nThis is the inner error');
          expect(err.foo).to.equal('bar');
          expect(err.code).to.equal(404);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithInnerErrorAndParamMessage/);
              expect(err.stack).to.match(/makeInnerError/);
            }
          }

          if (STACK_TRACE_INCLUDES_ERROR_NAME_AND_MESSAGE) {
            expect(err.stack).to.match(/RangeError: This is the inner error/);
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            foo: 'bar',
            code: 404
          }));
        }
      );

      it('can be called with just a props object',
        function () {
          var now = new Date();

          function foo () {}

          function newErrorWithProps () {
            return ono({
              code: 404,
              text: 'Not Found',
              timestamp: now,
              foo: foo
            });
          }

          var err = newErrorWithProps();

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('');
          expect(err.code).to.equal(404);
          expect(err.text).to.equal('Not Found');
          expect(err.timestamp).to.equal(now);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithProps/);
            }
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: 404,
            text: 'Not Found',
            timestamp: now.toJSON()
          }));
        }
      );

      it('can be called with an inner DOM error and a props object',
        function () {
          var now = new Date();

          function someMethod () { return this.code; }

          function newErrorWithDOMErrorAndProps (domError) {
            return ono(domError, {
              code: 404,
              text: 'Not Found',
              timestamp: now,
              someMethod: someMethod
            });
          }

          var err = newErrorWithDOMErrorAndProps(makeDOMError());

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('This is a DOM error');
          expect(err.code).to.equal(404);
          expect(err.text).to.equal('Not Found');
          expect(err.timestamp).to.equal(now);
          expect(err.someMethod).to.equal(someMethod);
          expect(err.someMethod()).to.equal(404);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).not.to.match(/makeDOMError/);
              expect(err.stack).to.match(/newErrorWithDOMErrorAndProps/);
            }
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: 404,
            text: 'Not Found',
            timestamp: now.toJSON(),
          }));
        }
      );

      it('can be called with an inner error and a props object',
        function () {
          var now = new Date();

          function someMethod () { return this.code; }

          function makeInnerError () {
            var innerError = new EvalError('This is the inner error');
            innerError.foo = 'bar';
            innerError.code = 500;
            return innerError;
          }

          function newErrorWithInnerErrorAndProps (innerErr) {
            return ono(innerErr, {
              code: 404,
              text: 'Not Found',
              timestamp: now,
              someMethod: someMethod
            });
          }

          var err = newErrorWithInnerErrorAndProps(makeInnerError());

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('This is the inner error');
          expect(err.code).to.equal(404);
          expect(err.text).to.equal('Not Found');
          expect(err.timestamp).to.equal(now);
          expect(err.foo).to.equal('bar');
          expect(err.someMethod).to.equal(someMethod);
          expect(err.someMethod()).to.equal(404);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/makeInnerError/);
              expect(err.stack).to.match(/newErrorWithInnerErrorAndProps/);
            }
          }

          if (STACK_TRACE_INCLUDES_ERROR_NAME_AND_MESSAGE) {
            expect(err.stack).to.match(/EvalError: This is the inner error/);
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: 404,
            text: 'Not Found',
            timestamp: now.toJSON(),
            foo: 'bar'
          }));
        }
      );

      it('can be called with a non-eror and a props object',
        function () {
          var now = new Date();

          function someMethod () { return this.code; }

          function makeNonError () {
            return {
              code: 'ERESET',
              name: 'TypeError',
              message: "This looks like an error, but it's not one",
              stack: 'at foo.js:15:27\n  at bar.js:86:12',
              foo: 'bar',
            };
          }

          function newErrorWithNonErrorAndProps (nonError) {
            return ono(nonError, {
              code: 404,
              text: 'Not Found',
              timestamp: now,
              someMethod: someMethod
            });
          }

          var err = newErrorWithNonErrorAndProps(makeNonError());

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal("This looks like an error, but it's not one");
          expect(err.code).to.equal(404);
          expect(err.text).to.equal('Not Found');
          expect(err.timestamp).to.equal(now);
          expect(err.foo).to.equal('bar');
          expect(err.someMethod).to.equal(someMethod);
          expect(err.someMethod()).to.equal(404);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);
            expect(err.stack).to.match(/foo\.js/);
            expect(err.stack).to.match(/bar\.js/);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithNonErrorAndProps/);
            }
          }

          if (STACK_TRACE_INCLUDES_ERROR_NAME_AND_MESSAGE) {
            expect(err.stack).to.match(/Error: This looks like an error, but it's not one/);
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: 404,
            text: 'Not Found',
            timestamp: now.toJSON(),
            foo: 'bar'
          }));
        }
      );

      it('can be called with a props object and a message',
        function () {
          var now = new Date();

          function someMethod () { return this.code; }

          function newErrorWithPropsAndMessage () {
            return ono({
              code: 404,
              text: 'Not Found',
              timestamp: now,
              someMethod: someMethod
            }, 'Onoes! Something bad happened.');
          }

          var err = newErrorWithPropsAndMessage();

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Onoes! Something bad happened.');
          expect(err.code).to.equal(404);
          expect(err.text).to.equal('Not Found');
          expect(err.timestamp).to.equal(now);
          expect(err.someMethod).to.equal(someMethod);
          expect(err.someMethod()).to.equal(404);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithPropsAndMessage/);
            }
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: 404,
            text: 'Not Found',
            timestamp: now.toJSON()
          }));
        });

      it('can be called with a props object and a parameterized message',
        function () {
          var now = new Date();

          function foo () {}

          function newErrorWithPropsAndParamMessage () {
            return ono({
              code: 404,
              text: 'Not Found',
              timestamp: now,
              foo: foo
            }, 'Testing, %s, %d, %j', 1, '2', '3');
          }

          var err = newErrorWithPropsAndParamMessage();

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Testing, 1, 2, "3"');
          expect(err.code).to.equal(404);
          expect(err.text).to.equal('Not Found');
          expect(err.timestamp).to.equal(now);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithPropsAndParamMessage/);
            }
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: 404,
            text: 'Not Found',
            timestamp: now.toJSON()
          }));
        }
      );

      it('can be called with an inner error, props object, and a parameterized message',
        function () {
          var now = new Date();

          function someMethod () { return this.code; }

          function makeInnerError () {
            var innerError = new EvalError('This is the inner error');
            innerError.foo = 'bar';
            innerError.code = 500;
            return innerError;
          }

          function newErrorWithInnerErrorPropsAndParamMessage (innerErr) {
            return ono(
              innerErr,
              {
                code: 404,
                text: 'Not Found',
                timestamp: now,
                someMethod: someMethod
              },
              'Testing, %s, %d, %j', 1, '2', '3'
            );
          }

          var err = newErrorWithInnerErrorPropsAndParamMessage(makeInnerError());

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Testing, 1, 2, "3" \nThis is the inner error');
          expect(err.code).to.equal(404);
          expect(err.text).to.equal('Not Found');
          expect(err.timestamp).to.equal(now);
          expect(err.foo).to.equal('bar');
          expect(err.someMethod).to.equal(someMethod);
          expect(err.someMethod()).to.equal(404);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithInnerErrorPropsAndParamMessage/);
              expect(err.stack).to.match(/makeInnerError/);
            }
          }

          if (STACK_TRACE_INCLUDES_ERROR_NAME_AND_MESSAGE) {
            expect(err.stack).to.match(/EvalError: This is the inner error/);
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: 404,
            text: 'Not Found',
            timestamp: now.toJSON(),
            foo: 'bar'
          }));
        }
      );

      it('can be called with an inner DOM error, props object, and a parameterized message',
        function () {
          var now = new Date();

          function someMethod () { return this.code; }

          function newErrorWithDOMErrorPropsAndParamMessage (domError) {
            return ono(
              domError,
              {
                code: 404,
                text: 'Not Found',
                timestamp: now,
                someMethod: someMethod
              },
              'Testing, %s, %d, %j', 1, '2', '3'
            );
          }

          var err = newErrorWithDOMErrorPropsAndParamMessage(makeDOMError());

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Testing, 1, 2, "3" \nThis is a DOM error');
          expect(err.code).to.equal(404);
          expect(err.text).to.equal('Not Found');
          expect(err.timestamp).to.equal(now);
          expect(err.someMethod).to.equal(someMethod);
          expect(err.someMethod()).to.equal(404);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).not.to.match(/makeDOMError/);
              expect(err.stack).to.match(/newErrorWithDOMErrorPropsAndParamMessage/);
            }
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: 404,
            text: 'Not Found',
            timestamp: now.toJSON(),
          }));
        }
      );

      it('can be called with a non-error, props object, and a parameterized message',
        function () {
          var now = new Date();

          function someMethod () { return this.code; }

          function makeNonError () {
            return {
              code: 'ERESET',
              name: 'TypeError',
              message: "This looks like an error, but it's not one",
              stack: 'at foo.js:15:27\n  at bar.js:86:12',
              foo: 'bar',
            };
          }

          function newErrorWithNonErrorPropsAndParamMessage (nonError) {
            return ono(
              nonError,
              {
                code: 404,
                text: 'Not Found',
                timestamp: now,
                someMethod: someMethod
              },
              'Testing, %s, %d, %j', 1, '2', '3'
            );
          }

          var err = newErrorWithNonErrorPropsAndParamMessage(makeNonError());

          expect(err).to.be.an.instanceOf(ErrorType);
          expect(err.name).to.equal(ErrorTypeName);
          expect(err.message).to.equal('Testing, 1, 2, "3" \nThis looks like an error, but it\'s not one');
          expect(err.code).to.equal(404);
          expect(err.text).to.equal('Not Found');
          expect(err.timestamp).to.equal(now);
          expect(err.foo).to.equal('bar');
          expect(err.someMethod).to.equal(someMethod);
          expect(err.someMethod()).to.equal(404);

          if (err.stack) {
            expect(err.stack).not.to.contain(factoryName);
            expect(err.stack).to.match(/foo\.js/);
            expect(err.stack).to.match(/bar\.js/);

            if (STACK_TRACES_HAVE_FUNCTION_NAMES) {
              expect(err.stack).to.match(/newErrorWithNonErrorPropsAndParamMessage/);
            }
          }

          if (STACK_TRACE_INCLUDES_ERROR_NAME_AND_MESSAGE) {
            expect(err.stack).to.match(/Error: Testing, 1, 2, "3" \nThis looks like an error, but it's not one/);
          }

          var json = JSON.parse(JSON.stringify(err));
          expect(json).to.satisfy(helper.matchesJSON({
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: 404,
            text: 'Not Found',
            timestamp: now.toJSON(),
            foo: 'bar'
          }));
        }
      );

    });

    function makeDOMError () {
      var domError;
      var errorName = 'DOMError';
      var errorMessage = 'This is a DOM error';

      try {
        // Try creating a DOMError
        domError = new DOMError(errorName, errorMessage);
      }
      catch (e) {
        try {
          // DOMError is not supported, so try a DOMException instead
          domError = new DOMException(errorMessage, errorName);
        }
        catch (e2) {
          // DOMException is also not supported
        }
      }

      if (!domError) {
        // Just return a POJO instead
        domError = { name: errorName, message: errorMessage };
      }

      return domError;
    }
  });

  describe('custom', function () {
    function CustomError (message) {
      // Maintains proper stack trace for where our error was thrown (only available on V8)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
      this.message = message;
    }

    CustomError.prototype = Object.create(Error.prototype);
    CustomError.prototype.name = 'CustomError';
    CustomError.prototype.constructor = CustomError;

    host.global.CustomError = CustomError;

    describe('ono', function () {
      it('should wrap the custom error', function () {
        var e = new CustomError('test message');
        var err = ono(e);

        expect(err).to.be.an.instanceOf(Error);
        expect(err.name).to.equal('Error');
        expect(err.message).to.equal('test message');
      });

      it('should wrap the custom error and add a message if not specified', function () {
        var e = new CustomError();
        var err = ono(e, 'test message');

        expect(err).to.be.an.instanceOf(Error);
        expect(err.name).to.equal('Error');
        expect(err.message).to.equal('test message');

        if (err.stack) {
          expect(err.stack).not.to.contain('onoFactory');

          if (STACK_TRACES_HAVE_FUNCTION_NAMES && Error.captureStackTrace) {
            expect(err.stack).to.match(/CustomError/);
          }
        }
      });
    });

    describe('ono.custom', function () {
      it('should create a custom error', function () {
        var err = ono.custom(CustomError);

        expect(err).to.be.an.instanceOf(CustomError);
        expect(err.name).to.equal('CustomError');

        if (err.stack) {
          expect(err.stack).not.to.contain('onoFactory');

          if (STACK_TRACES_HAVE_FUNCTION_NAMES && Error.captureStackTrace) {
            expect(err.stack).to.match(/CustomError/);
          }
        }
      });

      it('should create a custom error with a message', function () {
        var err = ono.custom(CustomError, 'test message');

        expect(err).to.be.an.instanceOf(CustomError);
        expect(err.name).to.equal('CustomError');
        expect(err.message).to.equal('test message');
      });

      it('should create a custom error with a message with params', function () {
        var err = ono.custom(CustomError, 'test message: "%s" %d', 'test', 1);

        expect(err).to.be.an.instanceOf(CustomError);
        expect(err.name).to.equal('CustomError');
        expect(err.message).to.equal('test message: "test" 1');
      });

      it('should create a custom error with props', function () {
        var err = ono.custom(CustomError, {
          prop: 'test'
        });

        expect(err).to.be.an.instanceOf(CustomError);
        expect(err.name).to.equal('CustomError');
        expect(err.prop).to.equal('test');
      });

      it('should create a custom error with props and a message', function () {
        var err = ono.custom(CustomError, {
          prop: 'test'
        }, 'test message');

        expect(err).to.be.an.instanceOf(CustomError);
        expect(err.name).to.equal('CustomError');
        expect(err.prop).to.equal('test');
        expect(err.message).to.equal('test message');
      });
    });
  });
}());
