# 🤖 Super Robot Wars T map converter

> [!CAUTION]
> Work in progress: not working yet

Convert maps from Super Robot Wars T to Collada.

The maps use a binary form of Collada. In theory, it should be easy to convert them back to XML. In practice, however, the Collada format is so complex that it's hard to reconstruct the original XML.

The binary files contains the XML nodes content and attributes, but the tags are missing. On top of the decompilation, this project aims at reconstructing the Collada XML markup, by guessing what the tags are meant to be.

This format may be used in other games too, but I haven't checked.

## How to use?

### Get the game assets

1. Buy the game, play it and enjoy it (I use the Switch version)
2. Dump it
3. From the NSP file extract the NCA files (using nstool)
4. From the NCA files extract the CPK files (using nstool)
5. The maps are located in the `mapdataest003switch` folder
6. Convert the `.bntx` textures to `.png`

### Get the code

Install node.js, clone this repo and install the dependencies:

```sh
npm install
```

Then call the command line:

```sh
node index.js [options] path/to/map/folder
```

## Command line options

| Option            | Description                  | Default |
| ----------------- | ---------------------------- | ------- |
| `--collada`, `-c` | Specify the Collada version. | 1.5.0   |
| `--version`, `-v` | Print the version number.    |         |

## Current status

The generated .dae files are not valid and do not work yet.

| Section       | Status                |
| ------------- | --------------------- |
| animations    | 🔴 Not implemented    |
| asset         | 🟢 Fully implemented  |
| controllers   | 🔴 Not implemented    |
| effects       | 🟠 Partly implemented |
| geometries    | 🌕 Mostly implemented |
| images        | 🟢 Fully implemented  |
| materials     | 🟠 Partly implemented |
| scene         | 🟢 Fully implemented  |
| visual_scenes | 🟠 Partly implemented |

## How can you help?

I need help from anyone familiar with the Collada format. Geometries, materials and effects are particular hard to figure out since they can be so many different configuration.

At first it would be great to sort out the geometries and using mock data for the rest.

Please get in touch on Mastodon: [edo999](https://mastodon.social/@edo999).
