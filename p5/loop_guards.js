const guard_loops = (function() {

// transform code
let loop_count = 0;
function with_loop_guard() {
    var guard_var = make_identifier('loop_guard');
    var cond = {
        "type": "UnaryExpression",
        "operator": "!",
        "argument": {
            "type": "UpdateExpression",
            "operator": "--",
            "argument": guard_var,
            "prefix": true
        },
        "prefix": true
    };
    return function(body) {
        let result;
        if (body.type === 'BlockStatement') {
            result = body.body;
        } else {
            result = [body];
        }
        result = [
            make_if(koduj_call('should_break_loop', literal(++loop_count)), [
                jump('break')
            ]),
            ...result
        ];
        return make_block(result);
    };
}
function jump(name) {
    const mapping = {
        "break": "BreakStatement",
        "continue": "ContinueStatement"
    };
    return {
        "type": mapping[name],
        "label": null
    };
}
function make_block(body) {
    return {
        "type": "BlockStatement",
        "body": body
    }
}
function literal(value) {
    return { type: 'Literal', value }
}
function make_if(test, body, alternative) {
    return {
        "type": "IfStatement",
        "test": test,
        "consequent": make_block(body),
        "alternate": alternative
    };
}
function make_identifier(name) {
    return {
        type: 'Identifier',
        name: name
    };
}
function expression_statement(expression) {
    return {
        "type": "ExpressionStatement",
        "expression": expression
    };
}
function koduj_prop(method) {
    return property2(make_identifier("__koduj__"), make_identifier(method), false);
}
function koduj_call(method, ...args) {
    return call(koduj_prop(method), ...args);
}
function property2(object, property, computed) {
    return {
        type: "MemberExpression",
        computed,
        object,
        property
    };
}
function call(callee, ...args) {
    return {
        type: "CallExpression",
        callee: callee,
        arguments: args
    };
}


const patch_loop_body = with_loop_guard();

function patch_body(body) {
    return body.flatMap(function(node) {
        if (loop_types.includes(node.type)) {
            node.body = patch_loop_body(node.body);
            return [node, expression_statement(koduj_call('exit_loop', literal(loop_count)))]
        }
        return node;
    });
}

const loop_types = ['ForStatement', 'ForOfStatement', 'ForInStatement', 'DoWhileStatement', 'WhileStatement'];

return function guard_loops(input) {
  loop_count = 0;
  const ast = espree.parse(input, { ecmaVersion: 14, sourceType: 'module' });

    estraverse.traverse(ast, {
        enter: function (node, parent) {
            if (node.type === 'Program') {
                node.body = patch_body(node.body);
            } else if (node?.body?.type === 'BlockStatement') {
                node.body.body = patch_body(node.body.body);
            }
        }
    });

    return escodegen.generate(ast);
}

})();
