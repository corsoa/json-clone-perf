const fs = require('fs');
const uuid = require('uuid');
const assert = require('assert');
const _ = require('lodash');

const base = fs.readFileSync('big-string.txt', 'utf8');
const numToGen = 10000;
console.log(`Beginning - ${JSON.stringify(process.memoryUsage(), null, 4)}`);
const doLodash = (() => {
  //base measure - how long to parse and concat using cloned lodash?
  console.time('lodash');
  const beforeUsage = process.memoryUsage().heapUsed;
  const baseModel = JSON.parse(base);
  const arrayOfResources = [];
  for (let i = 0; i < numToGen; i++) {
    const clonedModel = _.cloneDeep(baseModel);
    clonedModel[0]._id = uuid.v4();
    arrayOfResources.push(clonedModel);
  }
  JSON.stringify(arrayOfResources);
  const afterUsage = process.memoryUsage().heapUsed;
  console.log((afterUsage - beforeUsage) / 1024 / 1024);
  console.timeEnd('lodash');
});

const doConcat = (() => {
  //improved method
  console.time('concat');
  const beforeUsage = process.memoryUsage().heapUsed;
  let concat = '[';
  for (let i = 0; i < numToGen; i++) {
    const generatedGUID = uuid.v4();
    concat += base.replace('"_id":"5aa2188823d43de4cc66b5ce"', '"_id":"' + generatedGUID + '"');
    if (i !== numToGen - 1) {
      concat += ','
    }
  }
  concat += ']';
  const afterUsage = process.memoryUsage().heapUsed;
  console.timeEnd('concat');
  console.log((afterUsage - beforeUsage) / 1024 / 1024);
  //try to parse it...
  console.time('parseIt');
  const reParsed = JSON.parse(concat);
  console.timeEnd('parseIt');

  console.time('verifyIt');
  const uniqIDs = new Set();
  reParsed.forEach((arrayItem) => {
    uniqIDs.add(arrayItem[0]._id);
  });
  assert(uniqIDs.size, 5000, 'GUIDs should be unique');
  console.timeEnd('verifyIt');
});

doLodash();
doConcat();

console.log(`End - ${JSON.stringify(process.memoryUsage(), null, 4)}`);

