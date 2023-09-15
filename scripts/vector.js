const fs = require('fs');
const { CharacterTextSplitter } = require("langchain/text_splitter");
const { connect, WriteMode, OpenAIEmbeddingFunction } = require("vectordb");

async function main() {

  try {
    const angels = fs.readFileSync('scripts/angel.txt', 'utf8');
    const accelerators = fs.readFileSync('scripts/incubator-accelerator-programs.txt', 'utf8');
    const microVCs = fs.readFileSync('scripts/micro-vc.txt', 'utf8');

    const splitter = new CharacterTextSplitter({
      chunkSize: 768,
      chunkOverlap: 128,
    });

    const angelDocs = await splitter.createDocuments(
      [angels],
      [],
      {
        chunkHeader: `DOCUMENT NAME: Angel Investors\n\n---\n\n`,
        appendChunkOverlapHeader: true,
      }
    );

    const acceleratorDocs = await splitter.createDocuments(
      [accelerators],
      [],
      {
        chunkHeader: `DOCUMENT NAME: Accelerators and Institutional Programs\n\n---\n\n`,
        appendChunkOverlapHeader: true,
      }
    );

    const microVCDocs = await splitter.createDocuments(
      [microVCs],
      [],
      {
        chunkHeader: `DOCUMENT NAME: Micro VCs\n\n---\n\n`,
        appendChunkOverlapHeader: true,
      }
    );

    // console.log({ x: angelDocs, acceleratorDocs, m: JSON.stringify(microVCDocs[0].metadata )}) ;

    const db = await connect('data');
    const embedFunction = new OpenAIEmbeddingFunction('pageContent', process.env.OPENAI_API_KEY);

    // const table = await db.openTable('investors', embedFunction);

    const data = angelDocs.concat(acceleratorDocs, microVCDocs);

    // data.forEach((d) => {
    //   d.metadata = JSON.stringify(d.metadata);
    // });

    let table;

    await Promise.all(data.forEach(async (entry) => {
      console.log('<><><><><><><><>><', entry, '<><><><><><><><><><><');

    table = await db.createTable('investors', entry, embedFunction, {
      writeMode: WriteMode.Overwrite,
    });

    }));

    const resultOne = await table.search("investors in europe").limit(4).execute();
    console.log(resultOne);

  } catch (err) {
    console.error('An error occurred:', err);
  }
}

main();
