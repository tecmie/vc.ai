// const fs = require('fs');
import fs from 'fs'
import { Document } from "langchain/document";
import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
// const { TextLoader } = require("langchain/document_loaders/fs/text")
const EMBEDDING_SOURCE_COLUMN = 'text'

// const { connect, WriteMode, OpenAIEmbeddingFunction } = require('vectordb');
// const embedFunction = new OpenAIEmbeddingFunction(EMBEDDING_SOURCE_COLUMN, process.env.OPENAI_API_KEY);





try {
  const data = fs.readFileSync('scripts/angel.txt', 'utf8');
  // console.log(data.split('\"').join('\n').split(',\\').join('\n'));

  const angelInvestorLoader = new TextLoader("scripts/angel.txt");
  const acceleratorLoader = new TextLoader("scripts/incubator-accelerator-programs.txt");
  const microVCLoader = new TextLoader("scripts/micro-vc.txt");



console.log({ 
  angels: await angelInvestorLoader.load(),
  accelerators: await acceleratorLoader.load(),
  microVCs: await microVCLoader.load(),
 })


// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 50,
//   chunkOverlap: 1,
//   // separators: ["|", "##", ">", "-"],
//   // separators: ["|", "##", ">", "-"],
// });

const splitter = new CharacterTextSplitter({
  chunkSize: 1536,
  chunkOverlap: 200,
});


// const output = await splitter.createDocuments([data]);


// console.log({ output: JSON.stringify(output) })


} catch (err) {
  console.error('An error occurred:', err);
}




// const loader = new TextLoader("scripts/angel.txt");

// const docs = loader.load();

// console.log({ docs })