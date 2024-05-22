const Keyv = require('keyv');
const KeyvBetterSqlite3 = require('../src/index');

const kv = new Keyv({
    // store: new KeyvBetterSqlite3()
    store: new KeyvBetterSqlite3({
        uri: 'sqlite://test.sqlite'
    }),
});

async function test() {
    // await kv.clear();
    await kv.set('string', '字符', 1000);
    let retString = await kv.get('string');

    console.log(retString);

    await kv.set('number', 1);
    const retNumber = await kv.get('number');
    console.log(retNumber);

    await kv.set('object', {a:1,b:2,c:'你好'});
    const retObject = await kv.get('object');
    console.log(retObject);

    const arr = await kv.get(['number', 'string', 'object'])
    console.log(arr);

    kv.delete('string');
    retString = await kv.get('string');
    console.log(retString);

    for await (const [key, value] of kv.iterator()) {
        console.log(key, value);
    };
}

test();