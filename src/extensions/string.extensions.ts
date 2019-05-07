import replaceString from "replace-string";


(function() {
    Object.defineProperty(String.prototype, "replaceAll", {
        value: function(token: string, replace: string): string {
          return replaceString(this, token, replace);
        }
      });
    
})()
