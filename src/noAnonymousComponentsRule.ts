import * as ts from "typescript";

import * as Lint from "tslint";

export class Rule extends Lint.Rules.TypedRule {
    /* tslint:disable:object-literal-sort-keys */
    public static readonly metadata: Lint.IRuleMetadata = {
        ruleName: "no-anonymous-components",
        description: "Prevent 'unknown' components being present in the react dev tools.",
        descriptionDetails:
            "Unknown type components are harder to debug.",
        optionsDescription: "Not configurable.",
        options: null,
        optionExamples: [true],
        rationale: Lint.Utils.dedent`
            Some people will whinge if our components have unknown names, let's beat them
        `,
        type: "functionality",
        typescriptOnly: true,
        requiresTypeInfo: true,
    };
    /* tslint:enable:object-literal-sort-keys */

    public static readonly FAILURE_STRING = "Components must be named";

    public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
        return this.applyWithFunction(
            sourceFile,
            walk,
            ["Promise", ...(this.ruleArguments as ReadonlyArray<string>)],
            program.getTypeChecker(),
        );
    }
}

const AddErrorIsUnNamedFCE = (ctx: Lint.WalkContext<ReadonlyArray<string>>, tc: ts.TypeChecker, node: ts.Node) => {
    if (ts.isFunctionLike(node)) {
        const type = tc.getReturnTypeOfSignature(tc.getTypeAtLocation(node).getCallSignatures()[0]);
        if (type.symbol.name === "FunctionComponentElement" && node.name === undefined) {
            ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
        }
    }
};

const walk = (ctx: Lint.WalkContext<ReadonlyArray<string>>, tc: ts.TypeChecker) => {
    const cb = (node: ts.Node): void => {
        if (ts.isReturnStatement(node)) {
            const { expression } = node;
            if (expression) {
                AddErrorIsUnNamedFCE(ctx, tc, expression);
            }
        } else if (ts.isArrowFunction(node)) {
            const { body } = node;
            AddErrorIsUnNamedFCE(ctx, tc, body);
        }

        return ts.forEachChild(node, cb);
    };

    return ts.forEachChild(ctx.sourceFile, cb);
};
