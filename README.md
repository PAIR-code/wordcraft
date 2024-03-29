# ✨✍️ Wordcraft

Wordcraft is an LLM-powered text editor with an emphasis on short story writing.

[g.co/research/wordcraft](http://g.co/research/wordcraft)

Wordcraft is a tool built by researchers at Google
[PAIR](https://pair.withgoogle.com/) for writing stories with AI. The
application is powered by generative models such as
[Gemini](https://ai.google.dev/docs/).
At its core, generative models are simple machines — it's trained to
predict the most likely next word given a textual prompt. But because the model
is so large and has been trained on a massive amount of text, it's able to learn
higher-level concepts. It also demonstrates a fascinating emergent capability
often referred to as
[_in-context learning_](https://huggingface.co/blog/few-shot-learning-gpt-neo-and-inference-api).
By carefully designing input prompts, the model can be instructed to perform an
incredibly wide range of tasks.

However this process (often referred to as _prompt engineering_) is finicky and
difficult even for experienced practitioners. We built Wordcraft with the goal
of exploring how far we could push this technique through a carefully crafted
user interface, and to empower writers by giving them access to these
state-of-the-art tools.

# 👷‍♂️ Build

```bash
npm i
npm run dev
```

# ☁️ API

In order to run Wordcraft, you'll need a Gemini API key. Please follow the
instructions at
[ai.google.dev/tutorials/setup](https://ai.google.dev/tutorials/setup).
Once you have your API key, create a .env file and add the key!

```bash
touch .env
echo "API_KEY=\"<INSERT_API_KEY>\"" > .env
```

Remember, use your API keys securely. Do not share them with others, or embed
them directly in code that's exposed to the public! This application
stores/loads API keys on the client for ease of development, but these should be
removed in all production apps!

You can find more information about the Gemini API at
[ai.google.dev/docs/](https://ai.google.dev/docs/)

# 🤖 App

Wordcraft can be customized by adding additional models or adding
operations/controls. The basic architecture allows for a great deal of
flexibility in the

### `/app/context`

Defines the underlying data/examples that will be used to construct few-shot
instructions to the underlying language model. This example data can be
customized to fit a particular style or genre.

### `/app/core/operations`

Defines how the user's intent is combined with the document state, manages
updating the text editor, and handles user choices.

### `/app/models`

Defines how the data from the `Context` is combined with an `Operation` state to
construct text that will be sent to a mode, and parses model output.

## Customizing context

The Wordcraft application uses few-shot examples for constructing prompts to
send to the model. The style of the generated text is influenced by these
examples, and you can customize Wordcraft's style or genre by editing these
examples. These examples are found in `/app/context/json`, and follow a schema
defined in `/app/context/schema`.

## Adding new controls

To add a new custom control (e.g. a button that translates into pig latin):

- Create a new `pigLatinSchema` in `/app/context/schema.ts`
- Create a new `pig_latin_examples.json` in `/app/context/json/`
- Register the examples int the `WordCraftContext` constructor
  (`/app/context/index.ts`)
- Create a corresponding prompt handler in `/app/models/gemini/prompts`
- Register that prompt handler with the underlying `Model` class in
  `/app/models/gemini/index.ts`
- Create a new `PigLatinOperation` in `/app/core/operations`
- Register the operation in `main.ts`

<hr />

**This is not an officially supported Google product**
