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
            {},
            program.getTypeChecker(),
        );
    }
}

const GetFix = (exp: ts.Expression | ts.ConciseBody): Lint.Replacement[] => {
    const componentName = "Component";
    const cropEnd = Lint.Replacement.deleteText(exp.getEnd(), 1);
    if (ts.isArrowFunction(exp) && ts.isReturnStatement(exp.parent)) {
        return [
            Lint.Replacement.deleteText(exp.parent.getStart(), 6),
            Lint.Replacement.appendText(exp.getStart(), `const ${componentName} = `),
            cropEnd,
            Lint.Replacement.appendText(exp.getEnd(), `;\nreturn ${componentName};`),
        ];
    } else {
        return [
            Lint.Replacement.appendText(exp.getStart(), `{\nconst ${componentName} = `),
            cropEnd,
            Lint.Replacement.appendText(exp.getEnd(), `;\nreturn ${componentName};\n};`),
        ];
    }
};

const IsUnNamedFCE =
    (tc: ts.TypeChecker, node: ts.Expression | ts.ConciseBody) => {
        if (ts.isFunctionLike(node)) {
            const type = tc.getReturnTypeOfSignature(tc.getTypeAtLocation(node).getCallSignatures()[0]);
            if (type.symbol.name === "FunctionComponentElement" && node.name === undefined) {
                return true;
            }
        }
        return false;
    };

const AddErrorIsUnNamedFCE =
    (ctx: Lint.WalkContext<{}>, tc: ts.TypeChecker, node: ts.Expression | ts.ConciseBody) => {
        if (IsUnNamedFCE(tc, node)) {
            ctx.addFailureAtNode(node, Rule.FAILURE_STRING, GetFix(node));
        }
    };

const walk = (ctx: Lint.WalkContext<{}>, tc: ts.TypeChecker) => {
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
