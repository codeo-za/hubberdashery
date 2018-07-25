"use strict";

const
    expect = require("chai").expect,
    faker = require("faker"),
    _random = require("./random"),
    randomStringArray = _random.randomStringArray,
    randomFilename = _random.randomFilename,
    FilenameFilter = require("../src/filename-filter");

describe(`filename-filter`, () => {
    it(`should exist as a prototype`, () => {
        expect(() => new FilenameFilter()).not.to.throw;
    });
    function create(filterText) {
        return new FilenameFilter(filterText);
    }
    function toFileObject(s) {
        return {
            fileName: s
        };
    };
    function toFileName(o) {
        return o.fileName;
    }
    describe(`filter`, () => {
        it(`should exist as a function on the prototype`, () => {
            expect(FilenameFilter.prototype.filter).to.be.a("function");
        });

        [
            null,
            "",
            " ",
            "\t"
        ].forEach(text => {
            it(`should return all file elements when the filter text is: '${text}'`, () => {
                // Arrange
                const
                    sut = create(text),
                    files = randomStringArray().map(toFileObject);
                // Act
                const result = sut.filter(files).map(toFileName);
                // Assert
                expect(result).to.eql(files);
            });
        });

        describe(`simple file globbing`, () => {
            it(`should perform one simple file-extension filter`, () => {
                // Arrange
                const
                    sut = create("*.cs"),
                    expected1 = randomFilename("cs"),
                    unexpected = randomFilename("txt"),
                    files = [
                        expected1, unexpected
                    ].map(toFileObject);
                // Act
                const result = sut.filter(files).map(toFileName);
                // Assert
                expect(result).to.eql([expected1]);
            });

            it(`should perform one simple file-extension filter (multiple results)`, () => {
                // Arrange
                const
                    sut = create("*.cs"),
                    expected1 = randomFilename("cs"),
                    expected2 = randomFilename("cs"),
                    unexpected = randomFilename("txt"),
                    files = [
                        expected1, unexpected, expected2
                    ].map(toFileObject);
                // Act
                const result = sut.filter(files).map(toFileName);
                // Assert
                expect(result).to.eql([expected1, expected2]);
            });

            it(`should perform multiple filters inclusively`, () => {
                // Arrange
                const
                    sut = create("*.cs, *.txt"),
                    expected1 = randomFilename("cs"),
                    expected2 = randomFilename("txt"),
                    unexpected = randomFilename("jpg"),
                    files = [expected1, unexpected, expected2].map(toFileObject);
                // Act
                const result = sut.filter(files).map(toFileName);
                // Assert
                expect(result).to.eql([expected1, expected2]);
            });
        });
        describe(`negative filters`, () => {

            it(`should perform one negative filter`, () => {
                // Arrange
                const
                    sut = create("!*.cs"),
                    unexpected = randomFilename("cs"),
                    expected = randomFilename("jpg"),
                    files = [unexpected, expected].map(toFileObject);
                // Act
                const result = sut.filter(files).map(toFileName);
                // Assert
                expect(result).to.eql([expected]);
            });

            it(`should perform two negative filters`, () => {
                // Arrange
                const
                    sut = create("!*.cs, !*.txt"),
                    unpexpected1 = randomFilename("cs"),
                    unexpected2 = randomFilename("txt"),
                    expected = randomFilename("jpg"),
                    files = [unexpected2, unpexpected1, expected].map(toFileObject);
                // Act
                const result = sut.filter(files).map(toFileName);
                // Assert
                expect(result).to.eql([expected]);
            });
        });

        describe(`regex filters`, () => {
            it(`should handle a full-line match`, () => {
                // Arrange
                const
                    sut = create("^test.cs"),
                    expected1 = "test1cs",
                    expected2 = "test.cs",
                    unexpected = "path/to/test.cs",
                    files = [ expected1, unexpected, expected2 ].map(toFileObject);
                // Act
                const result = sut.filter(files).map(toFileName);
                // Assert
                expect(result).to.eql([expected1, expected2].map(toFileNames));
            });
        });
    });
});
