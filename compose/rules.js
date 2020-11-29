const quoteRules = function(){
	"use strict";
	const noWordEndRegExp = /[\B\s]$/;
	const noWordStartRegExp = /^[\B\s]/;
	return {
		get: function(quoteRule){
			return this[quoteRule];
		},
		en: [
			{
				key: '"',
				preventDefault: true,
				action: function(context){
					const previous = context.previous;
					if (!previous || previous.match(noWordEndRegExp)){
						return "\u201C";
					}
					const next = context.next;
					if (!next || next.match(noWordStartRegExp)){
						return "\u201D";
					}
				}
			},
			{
				key: "'",
				preventDefault: true,
				action: function(context){
					const previous = context.previous;
					if (!previous || previous.match(noWordEndRegExp)){
						return "\u2018";
					}
					const next = context.next;
					if (!next || next.match(noWordStartRegExp)){
						return "\u2019";
					}
				}
			},
		],
		de: [
			{
				key: '"',
				preventDefault: true,
				action: function(context){
					const previous = context.previous;
					if (!previous || (previous.match(noWordEndRegExp) && !previous.match(/\u201E[^\u201C]*$/))){
						return "\u201E";
					}
					const next = context.next;
					if (!next || next.match(noWordStartRegExp)){
						return "\u201C";
					}
				}
			},
			{
				key: "'",
				preventDefault: true,
				action: function(context){
					const previous = context.previous;
					if (!previous || (previous.match(noWordEndRegExp) && !previous.match(/\u201A[^\u2018]*$/))){
						return "\u201A";
					}
					const next = context.next;
					if (next && previous && !previous.match(noWordEndRegExp) && !next.match(noWordStartRegExp)){
						return "\u2019";
					}
					if (!next || next.match(noWordStartRegExp)){
						if (previous && !previous.match(/\u201A[^\u2018]*$/)){
							return "\u2019";
						}
						return "\u2018";
					}
				}
			},
		]
	};
}();
