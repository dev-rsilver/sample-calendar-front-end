/**
 * Class that includes helper function(s) for testing.
 */
class TestHelper 
{
    /**
     * Returns a boolean indicating whether a rendered component contains an element with specified
     * text in the set of elements returned by the specified query selector.
     * 
     * @param {any} div The div result of a ReactDOM.render call.
     * @param {string} querySelector A query selector, such as div[class='class1'] 
     * @param {string} text The text to find
     * @param {boolean} exactMatch If true, case-sensitive comparison.
     */
    static hasElement = function(div, querySelector, text, exactMatch) {
        var matches = div.querySelectorAll(querySelector);
        
        var found = false;
        
        for(var i = 0; i < matches.length; i++) {
            if(exactMatch) {
                if(matches[i].textContent.indexOf(text) >= 0) {
                    found = true;
                }
            } else {
                if(matches[i].textContent.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
                    found = true;
                }
            }
        }
        
        return found;
    }

}

export { TestHelper }