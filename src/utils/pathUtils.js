/**
 * Utility functions for handling file paths in the project tree
 */

/**
 * Builds a full path for a given file by traversing up its parent hierarchy
 * @param {Object} file - The file object
 * @param {Array} allFiles - Array of all files in the project (flat structure)
 * @returns {string} - The full path from root to the file
 */
export function buildFullPath(file, allFiles) {
    if (!file) return '';

    const path = [];
    let currentFile = file;

    // Build path by going up the parent chain
    while (currentFile) {
        path.unshift(currentFile.name);

        if (currentFile.parent) {
            // Find the parent file
            currentFile = allFiles.find(f => f._id === currentFile.parent);
        } else {
            break;
        }
    }

    return path.join('/');
}

/**
 * Builds a map of file IDs to their full paths for quick lookup
 * @param {Array} allFiles - Array of all files in the project (flat structure)
 * @returns {Object} - Map of fileId to full path
 */
export function buildPathMap(allFiles) {
    const pathMap = {};

    allFiles.forEach(file => {
        pathMap[file._id] = buildFullPath(file, allFiles);
    });

    return pathMap;
}

/**
 * Recursively flattens a tree structure into a flat array
 * @param {Array} tree - Tree structure with children arrays
 * @returns {Array} - Flat array of all files
 */
export function flattenTree(tree) {
    const flattened = [];

    function flatten(nodes) {
        nodes.forEach(node => {
            flattened.push(node);
            if (node.children && node.children.length > 0) {
                flatten(node.children);
            }
        });
    }

    flatten(tree);
    return flattened;
}
