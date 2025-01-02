"use strict";

require("dotenv").config();
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import {ContentBlock,TextBlock } from "@anthropic-ai/sdk/resources";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";

import fs from "fs";

const anthropic = new Anthropic();
const app = express();
app.use(express.json());

app.post("/template",  async (req, res) => {
  const prompt = req.body.prompt;

  const response = await anthropic.messages
  .create({
    messages: [{ role: "user",content : prompt
}],
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8000,
    system: "Return either node or react based on what do you think this project should be.Only return a single word, no other text"

  })
  const answer = (response.content[0]  as TextBlock).text;

  if (answer=="react") {
    res.json({prompts: [BASE_PROMPT, `Here is an artifact that contains all the files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`],
      uiPrompts:[reactBasePrompt]
    })
    return;
    } 

    if (answer=="node") {
      res.json({prompts: [`Here is an artifact that contains all the files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`], 
        uiPrompts:[nodeBasePrompt]
      })
      return;
      }
    res.status(403).json({message: "Invalid answer"});
    return;
  
})

app.post("/chat", async (req, res) => {
  const messages  = req.body.messages;
  const response = await anthropic.messages
  .create({
    messages: messages,
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 6000,
    system: getSystemPrompt() 
  })

console.log(response);
res.json({});
})

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

// async function main() {
//   anthropic.messages
//     .stream({
//       messages: [{ role: "user",content :"For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.\n\n"
//  },
//       { role: "user", content: "create a simple todo application" },
    
    
//     ],
//       model: "claude-3-5-sonnet-20241022",
//       max_tokens: 1024,
//       system: getSystemPrompt()

//     })
//     .on("text", (text) => {
//       console.log(text);
//     });
// }

// main();


// Updated: 2025-04-29T06:17:03.333Z
