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


/**
 * Clears all existing branches,
 * leaving one branch containing only the START_TEXT
 * (Can be called without parameters)
 */
function reset(req, res) {
    BRANCHES = [START_TEXT];
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
 * Sends the last post from a random branch, along with the branch's index
 */
function getFromRandomBranch(req, res) {

    var branchIndex = randomBranchIndex();
    var text = BRANCHES[branchIndex].slice(-LINES_PER_POST);
    var position = BRANCHES[branchIndex].length;

    res.json({
        text: text,
        branch: branchIndex,
        position: position,
        desiredLines: LINES_PER_POST
    });
}


/**
 * Adds req.body.text to req.body.branch
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
        position                     // Position supplied
        && BRANCHES[branchIndex]     // Branch supplied and exists
        && textIsValid(text)) {      // Text supplied and is valid

        if (BRANCHES[branchIndex].length === position) {

            // No divergence necessary
            BRANCHES[branchIndex] = BRANCHES[branchIndex].concat(text);
            res.status(200); // OK

        } else {

            // Fork branch
            var fork = BRANCHES[branchIndex].slice(0, position);
            fork = fork.concat(text);
            BRANCHES.push(fork);
            res.status(201); // Created
        }
    } else {

        // Request was improperly formatted or branch was deleted
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
 * Returns the index of a random branch
 */
function randomBranchIndex() {
    return Math.floor(Math.random() * BRANCHES.length);
}