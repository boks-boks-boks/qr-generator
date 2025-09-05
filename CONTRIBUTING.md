## How to contribute

Every code suggestion are welcomed but before sending you pr, please do the following :

### How to install 

```bash
git clone https://github.com/boks-boks-boks/qr-generator
cd qr-generator
npm i
npx tsc
node index.js
```

### How to test

You can directly test your code by trying to compile it 

```bash
npm run build
```

You can then try to check if the resulting qr code looks as expected by running 

```bash
cd sample
npm run dev
```

In the `sample/index.js` file, you can add a debug grid by using : 

```js
/*
    function textTocanvas(
        canvas: HTMLCanvasElement,
        text: string,
        isDebugContext: boolean
    )
*/
textToCanvas(canvas, "www.myurl.com", true)
```