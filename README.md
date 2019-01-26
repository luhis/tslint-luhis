# tslint-luhis

## Background

Whist working on a React higher order component library I ran into an issue where it created components that functioned correctly, but behaved less than perfectly when inspected in debug mode with the React Dev Tools.  This is easily fixed, but it leaves with code that is more verbose than some would normally write.  This package contains a rule to cover that instance to ensure that names are given to React components.

## Installing

`npm install tslint-luhis --save-dev`

Then add the ruleset to your tslint.json configuration:

`"extends": [
        "tslint:recommended",
        "tslint-luhis"
    ],`
