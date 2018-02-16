var 
    faker = require("faker"),
    range = require("./range");
module.exports = {
    randomStringArray: (minElements, maxElements) => {
        minElements = minElements === undefined ? 1 : minElements;
        maxElements = maxElements === undefined ? minElements + 5 : maxElements;
        var actualElements = faker.random.number({ min: minElements, max: maxElements });
        return range(0, actualElements).map(() => faker.random.word());
    },
    randomFilename: (withExtension) => {
        withExtension = withExtension || ".txt";
        if (withExtension[0] !== ".") {
            withExtension = `.${withExtension}`;
        }
        return `${faker.random.word()}${withExtension}`;
    }
}