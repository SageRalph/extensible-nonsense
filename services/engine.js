const START_TEXT = [
    'The story starts here',
    'By many authors, with much divergence',
    'From chaos comes narrative',
    'Begin'
];


// Initialise
const LINES_PER_POST = START_TEXT.length;
var BRANCHES;
reset();


// Export functions
module.exports = {
    reset: reset,
    getAllBranches: getAllBranches,
    getFromRandomBranch: getFromRandomBranch,
    postToBranch: postToBranch
};


function Branch(parentIndex, position, divergingText) {

    // Construct
    if (isDefined(parentIndex) && isDefined(position)) {

        // Branch is a fork
        var parentText = BRANCHES[parentIndex].text.slice(0, position);
        this.text = parentText.concat(divergingText || []);
        this.splitPosition = position;
        this.parentIndex = parentIndex;

    } else {
        // Branch is a root
        this.text = START_TEXT;
    }
    this.index = BRANCHES.push(this) - 1;

    // Functions
    this.append = function (newText, preLength) {

        if (this.text.length === preLength) {

            // No divergence necessary
            this.text = this.text.concat(newText);

        } else {

            // Fork Branch
            new Branch(this.index, preLength, newText);
        }
    };
    this.snippet = function () {
        return this.text.slice(-LINES_PER_POST);
    };

    return this;
}


/**
 * Clears all existing branches,
 * leaving one Branch containing only the START_TEXT
 * (Can be called without parameters)
 */
function reset(req, res) {
    BRANCHES = [];
    new Branch();
    if (res) {
        res.status(204);
    }
}


/**
 * Sends an array of all branches
 */
function getAllBranches(req, res) {
    res.json(BRANCHES);
}


/**
 * Sends the last post from a random Branch, along with the Branch's index
 */
function getFromRandomBranch(req, res) {

    var branchIndex = randomBranchIndex();
    console.log(BRANCHES);
    console.log(branchIndex);
    var text = BRANCHES[branchIndex].snippet();
    var position = BRANCHES[branchIndex].text.length;

    res.json({
        text: text,
        branch: branchIndex,
        position: position,
        desiredLines: LINES_PER_POST
    });
}


/**
 * Adds req.body.text to req.body.Branch
 */
function postToBranch(req, res) {

    var position = req.body.position;
    var branchIndex = req.body.branch;
    var text = req.body.text;
    var flagged = req.body.flagged;

    if (flagged) {
        res.status(501); // Not Implemented
        // TODO - allow deletion of bad items
    }
    else if (
        isDefined(position)          // Position supplied
        && BRANCHES[branchIndex]     // Branch supplied and exists
        && textIsValid(text)) {      // Text supplied and is valid

        BRANCHES[branchIndex].append(text, position);
        res.status(201); // Created

    } else {

        // Request was improperly formatted or Branch was deleted
        res.status(422); // Unprocessable Entity
    }
    return getFromRandomBranch(req, res);
}


/**
 * Returns whether text is a valid addition.
 * Text should be an array of LINES_PER_POST strings.
 */
function textIsValid(text) {
    return Array.isArray(text) && text.length === LINES_PER_POST;
}


/**
 * Returns the index of a random Branch
 */
function randomBranchIndex() {
    return Math.floor(Math.random() * BRANCHES.length);
}


/**
 * Returns whether obj has a non-null value
 */
function isDefined(obj) {
    return typeof obj != 'undefined' && typeof obj != 'null';
}