const quoteRules = function(){
	"use strict";
	const noWordEndRegExp = /\B$/;
	const noWordStartRegExp = /^\B/;
	return {
		get: function(quoteRule){
			return this[quoteRule];
		},
		en: [
			{
				key: '"',
				preventDefault: true,
				action: function(context){
					if (!context.previous || context.previous.match(noWordEndRegExp)){
						return "\u201C";
					}
					else if (!context.next || context.next.match(noWordStartRegExp)){
						return "\u201D";
					}
				}
			},
			{
				key: "'",
				preventDefault: true,
				action: function(context){
					if (!context.previous || context.previous.match(noWordEndRegExp)){
						return "\u2018";
					}
					else if (!context.next || context.next.match(noWordStartRegExp)){
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
					if (!next || next.match(noWordEndRegExp)){
						return "\u201C";
					}
				}
			},
			{
				key: "'",
				preventDefault: true,
				action: function(context){
					return "\u2019";
				}
			},
		]
	};
}();