import fs from 'fs'
import * as path from "node:path";
import * as os from "node:os";

import { Document } from "langchain/document";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { connect, WriteMode, OpenAIEmbeddingFunction } from "vectordb";

  
  // const db = await connect('data');
  const embedFunction = new OpenAIEmbeddingFunction('pageContent', process.env.OPENAI_API_KEY);


try {



 
  // const angelInvestorLoader = new TextLoader("scripts/angel.txt");
  // const acceleratorLoader = new TextLoader("scripts/incubator-accelerator-programs.txt");
  // const microVCLoader = new TextLoader("scripts/micro-vc.txt");

  
  // const angels = await angelInvestorLoader.load()
  // const accelerators = await acceleratorLoader.load()
  // const microVCs = await microVCLoader.load()
  



const angels = fs.readFileSync('scripts/angel.txt', 'utf8');
const accelerators = fs.readFileSync('scripts/incubator-accelerator-programs.txt', 'utf8');
const microVCs = fs.readFileSync('scripts/micro-vc.txt', 'utf8');


const splitter = new CharacterTextSplitter({
  chunkSize: 128,
  chunkOverlap: 32,
});

// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 128,
//   chunkOverlap: 32,
// });

// console.log(angels[0].metadata, '<><><><><><><><><><><><><><><>')


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


  // console.log({ angelDocs, acceleratorDocs, microVCDocs })


  // const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lancedb-"));
  const db = await connect('/Users/apple/Desktop/vectors');
  const data = angelDocs.concat(acceleratorDocs, microVCDocs)




  const table = await db.openTable("investors", embedFunction);

  await Promise.all(data.forEach(async (entry) => {
    console.log('<><><><><><><><>><', entry, '<><><><><><><><><><><');

    if(!entry.pageContent) return;

    await table.add([entry]);

    
  }));
  
  
  
  // table = await db.createTable('investors', entry, embedFunction, {
  //   writeMode: WriteMode.Overwrite,
  // });

  // const table = await db.createTable('investors', microVCDocs, embedFunction, {
  //   writeMode: WriteMode.Overwrite,
  // });




  // const table = await db.createTable("vectors", [
  //   { vector: Array(1536), text: "sample", source: "a" },
  // ]);

 

  // const vectorStore = await LanceDB.fromDocuments(
  //   angelDocs.concat(acceleratorDocs, microVCDocs),
  //   new OpenAIEmbeddings(),
  //   { table }
  // );



  const resultOne = await table.search("investors in europe").limit(4).execute();
  console.log(resultOne);




} catch (err) {
  console.error('An error occurred:', err);
}



 
  // const angelInvestorLoader = new TextLoader("scripts/angel.txt");
  // const acceleratorLoader = new TextLoader("scripts/incubator-accelerator-programs.txt");
  // const microVCLoader = new TextLoader("scripts/micro-vc.txt");
  // const angels = await angelInvestorLoader.load()
  // const accelerators = await acceleratorLoader.load()
  // const microVCs = await microVCLoader.load()
  


// const handleQuery = async (query, uri) => {


//   const db = await connect(uri);
//   const table = await db.openTable("vectors");

//   const vectorStore = new LanceDB(new OpenAIEmbeddings(), { table });


//   const model = new OpenAI({ temperature: 0 });

//   const chain = new RetrievalQAChain({
//     combineDocumentsChain: loadQAStuffChain(model),
//     retriever: vectorStore.asRetriever(),
//     returnSourceDocuments: true,
//   });
//   const res = await chain.call({
//     query: "What is Pam's favorite color?",
//   });
  
//   console.log(JSON.stringify(res, null, 2));
  
// }  