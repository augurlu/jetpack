<?php
/**
 * This is an automatically generated baseline for Phan issues.
 * When Phan is invoked with --load-baseline=path/to/baseline.php,
 * The pre-existing issues listed in this file won't be emitted.
 *
 * This file can be updated by invoking Phan with --save-baseline=path/to/baseline.php
 * (can be combined with --load-baseline)
 */
return [
    // # Issue statistics:
    // PhanTypeMismatchArgumentInternal : 30+ occurrences
    // PhanUndeclaredClassMethod : 15+ occurrences
    // PhanPluginSimplifyExpressionBool : 8 occurrences
    // PhanTypeMismatchArgumentNullableInternal : 8 occurrences
    // PhanUndeclaredConstant : 8 occurrences
    // PhanTypeMismatchArgument : 7 occurrences
    // PhanPossiblyUndeclaredVariable : 6 occurrences
    // PhanTypePossiblyInvalidDimOffset : 6 occurrences
    // PhanPluginUnreachableCode : 5 occurrences
    // PhanTypeMismatchArgumentProbablyReal : 5 occurrences
    // PhanPluginDuplicateConditionalNullCoalescing : 4 occurrences
    // PhanTypeArraySuspiciousNullable : 4 occurrences
    // PhanUndeclaredVariableDim : 4 occurrences
    // PhanCommentParamWithoutRealParam : 3 occurrences
    // PhanTypeMismatchDimFetch : 3 occurrences
    // PhanUndeclaredFunction : 3 occurrences
    // PhanDeprecatedFunction : 2 occurrences
    // PhanPluginNeverReturnMethod : 2 occurrences
    // PhanRedefineFunction : 2 occurrences
    // PhanTypeExpectedObjectPropAccessButGotNull : 2 occurrences
    // PhanTypeNonVarPassByRef : 2 occurrences
    // PhanTypeSuspiciousStringExpression : 2 occurrences
    // PhanUndeclaredMethod : 2 occurrences
    // PhanUndeclaredVariable : 2 occurrences
    // PhanAccessMethodProtected : 1 occurrence
    // PhanParamSpecial1 : 1 occurrence
    // PhanPluginDuplicateExpressionAssignment : 1 occurrence
    // PhanTypeInvalidDimOffset : 1 occurrence
    // PhanTypeInvalidRightOperandOfNumericOp : 1 occurrence
    // PhanTypeObjectUnsetDeclaredProperty : 1 occurrence
    // PhanUndeclaredClassReference : 1 occurrence
    // PhanUndeclaredFunctionInCallable : 1 occurrence

    // Currently, file_suppressions and directory_suppressions are the only supported suppressions
    'file_suppressions' => [
        'class.vaultpress-cli.php' => ['PhanUndeclaredFunctionInCallable'],
        'class.vaultpress-database.php' => ['PhanParamSpecial1', 'PhanPluginDuplicateConditionalNullCoalescing', 'PhanPossiblyUndeclaredVariable', 'PhanTypeArraySuspiciousNullable', 'PhanTypeMismatchArgumentInternal', 'PhanTypeMismatchArgumentNullableInternal', 'PhanTypeNonVarPassByRef', 'PhanTypeObjectUnsetDeclaredProperty', 'PhanUndeclaredConstant', 'PhanUndeclaredVariableDim'],
        'class.vaultpress-filesystem.php' => ['PhanPluginNeverReturnMethod', 'PhanPluginSimplifyExpressionBool', 'PhanPluginUnreachableCode', 'PhanPossiblyUndeclaredVariable', 'PhanTypeMismatchArgumentNullableInternal', 'PhanTypeNonVarPassByRef', 'PhanTypeSuspiciousStringExpression', 'PhanUndeclaredVariable'],
        'class.vaultpress-hotfixes.php' => ['PhanDeprecatedFunction', 'PhanPluginSimplifyExpressionBool', 'PhanRedefineFunction', 'PhanTypeMismatchArgumentNullableInternal', 'PhanTypePossiblyInvalidDimOffset'],
        'cron-tasks.php' => ['PhanRedefineFunction'],
        'vaultpress.php' => ['PhanAccessMethodProtected', 'PhanDeprecatedFunction', 'PhanPluginDuplicateConditionalNullCoalescing', 'PhanPluginDuplicateExpressionAssignment', 'PhanPluginNeverReturnMethod', 'PhanPluginSimplifyExpressionBool', 'PhanPluginUnreachableCode', 'PhanPossiblyUndeclaredVariable', 'PhanTypeArraySuspiciousNullable', 'PhanTypeExpectedObjectPropAccessButGotNull', 'PhanTypeInvalidRightOperandOfNumericOp', 'PhanTypeMismatchArgument', 'PhanTypeMismatchArgumentInternal', 'PhanTypeMismatchArgumentNullableInternal', 'PhanTypeMismatchArgumentProbablyReal', 'PhanTypeMismatchDimFetch', 'PhanTypePossiblyInvalidDimOffset', 'PhanTypeSuspiciousStringExpression', 'PhanUndeclaredClassMethod', 'PhanUndeclaredClassReference', 'PhanUndeclaredConstant', 'PhanUndeclaredFunction', 'PhanUndeclaredMethod', 'PhanUndeclaredVariable'],
        'vp-scanner.php' => ['PhanCommentParamWithoutRealParam', 'PhanPossiblyUndeclaredVariable', 'PhanTypeInvalidDimOffset', 'PhanTypeMismatchArgumentInternal', 'PhanTypeMismatchArgumentNullableInternal', 'PhanUndeclaredFunction'],
    ],
    // 'directory_suppressions' => ['src/directory_name' => ['PhanIssueName1', 'PhanIssueName2']] can be manually added if needed.
    // (directory_suppressions will currently be ignored by subsequent calls to --save-baseline, but may be preserved in future Phan releases)
];
