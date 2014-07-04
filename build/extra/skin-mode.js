CodeMirror.defineMode("helma-skin", function(config, parserConfig) {

  //config settings
  var macroStartRegex = parserConfig.macroStartRegex || /^<%/i,
      macroEndRegex = parserConfig.macroEndRegex || /^%>/i;

  //inner modes
  var htmlMixedMode;
  var macroMode = {
      startState: function() {
         return {}
      },
      token: function(stream, state) {
         var c = stream.next();
         return 'helma-macro';
      }
   }

  //tokenizer when in html mode
  function htmlDispatch(stream, state) {
      if (stream.match(macroStartRegex, false)) {
          state.token=macroDispatch;
          return macroMode.token(stream, state.macroState);
          }
      else
          return htmlMixedMode.token(stream, state.htmlState);
    }

  //tokenizer when in macro mode
  function macroDispatch(stream, state) {
      if (stream.match(macroEndRegex, false))  {
          state.token=htmlDispatch;
          return htmlMixedMode.token(stream, state.htmlState);
         }
      else{
          var style = macroMode.token(stream, state.macroState);
          return style;
         }
      }


  return {
    startState: function() {
      htmlMixedMode = htmlMixedMode || CodeMirror.getMode(config, "htmlmixed");
      return {
          token :  parserConfig.startOpen ? macroDispatch : htmlDispatch,
          htmlState : htmlMixedMode.startState(),
          macroState : macroMode.startState()
          }
    },

    token: function(stream, state) {
      return state.token(stream, state);
    },

    indent: function(state, textAfter) {
      if (state.token == htmlDispatch)
        return htmlMixedMode.indent(state.htmlState, textAfter);
      else
        return macroMode.indent(state.macroState, textAfter);
    },

    copyState: function(state) {
      return {
       token : state.token,
       htmlState : CodeMirror.copyState(htmlMixedMode, state.htmlState),
       macroState : CodeMirror.copyState(macroMode, state.macroState)
       }
    },


    electricChars: "/{}:"
  }
}, "htmlmixed");

CodeMirror.defineMIME("application/x-helma-skin", { name: "helma-skin" });
