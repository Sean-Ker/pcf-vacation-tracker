import React from "react";

const KeybindsHelp = () => {
    return (
        <>
            <p>
                <kbd>shift + mousewheel</kbd> to move timeline left/right
            </p>
            <p>
                <kbd>alt + mousewheel</kbd> to zoom in/out
            </p>
            <p>
                <kbd>ctrl + mousewheel</kbd> to zoom in/out 10× faster
            </p>
            <p>
                <kbd>(win or cmd) + mousewheel</kbd> to zoom in/out 3x faster
            </p>
        </>
    );
};

export default KeybindsHelp;
