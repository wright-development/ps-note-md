#!/usr/bin/env node

const csv = require('fast-csv');
const fs = require('fs');

const argv = require('yargs')
.version('1.0.1')
.usage('Usage: $0 [csv] -m [md]')
.demandCommand(1, "You must specify the name of the csv to convert to markdown.")
.describe('m', 'The name of the md file to be saved.')
.alias('m', 'markdown')
.default('m', 'notes.md')
.help('h')
.alias('h', 'help')
.epilog('copyright 2017')
.argv;

const stream = fs.createReadStream(argv._[0])

const NOTE_INDEX = 0, COURSE_INDEX = 1, MODULE_INDEX = 2, CLIP_INDEX = 3;

let titles;
let courseName;
let noteContent = [];

const mapNote = (titles, content) => {

    var note = {};

    note[titles[NOTE_INDEX]] = content[NOTE_INDEX]
    note[titles[MODULE_INDEX]] = content[MODULE_INDEX]
    note[titles[CLIP_INDEX]] = content[CLIP_INDEX]

    return note;
}

const notesStream = csv({
        trim: true
    })
    .on('data', (data)=>{
        if(!titles) {
            titles = data;
        }else {
            if(!courseName) {
                courseName = data[COURSE_INDEX];
            }
            noteContent.push(mapNote(titles, data))
        }
    })
    .on('end', ()=>{
        let mdContent = `# ${courseName}\n\n`
        let lastModule;
        let lastClip;

        noteContent.forEach(note => {
            if(note[titles[MODULE_INDEX]] !== lastModule) {
                mdContent += `## ${note[titles[MODULE_INDEX]]}\n\n`;
                lastModule = note[titles[MODULE_INDEX]];
            }

            if(note[titles[CLIP_INDEX]] !== lastClip) {
                mdContent += `### ${note[titles[CLIP_INDEX]]}\n\n`;
                lastClip = note[titles[CLIP_INDEX]];
            }

            mdContent += note[titles[NOTE_INDEX]] + '\n\n';
        });

        fs.writeFileSync(argv.markdown, mdContent);
    });

stream.pipe(notesStream);
