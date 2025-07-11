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
    // PhanPluginDuplicateConditionalNullCoalescing : 10+ occurrences
    // PhanTypeMismatchReturnProbablyReal : 9 occurrences
    // PhanTypeMismatchArgumentProbablyReal : 7 occurrences
    // PhanTypeMismatchArgument : 6 occurrences
    // PhanImpossibleCondition : 4 occurrences
    // PhanTypeMismatchReturn : 4 occurrences
    // PhanPluginMixedKeyNoKey : 3 occurrences
    // PhanTypeMismatchProperty : 3 occurrences
    // PhanTypeSuspiciousEcho : 3 occurrences
    // PhanDeprecatedFunction : 2 occurrences
    // PhanNoopNew : 2 occurrences
    // PhanDeprecatedPartiallySupportedCallable : 1 occurrence
    // PhanPluginRedundantAssignment : 1 occurrence
    // PhanPluginSimplifyExpressionBool : 1 occurrence
    // PhanPossiblyUndeclaredVariable : 1 occurrence
    // PhanTypeInvalidDimOffset : 1 occurrence
    // PhanTypeMismatchDeclaredParamNullable : 1 occurrence
    // PhanTypeMismatchDefault : 1 occurrence
    // PhanTypeMismatchDimAssignment : 1 occurrence
    // PhanTypePossiblyInvalidDimOffset : 1 occurrence
    // PhanUndeclaredClassMethod : 1 occurrence

    // Currently, file_suppressions and directory_suppressions are the only supported suppressions
    'file_suppressions' => [
        'src/class-cli.php' => ['PhanTypeMismatchArgument'],
        'src/class-helper.php' => ['PhanDeprecatedPartiallySupportedCallable', 'PhanImpossibleCondition', 'PhanPluginDuplicateConditionalNullCoalescing', 'PhanTypeMismatchArgument', 'PhanTypeMismatchDefault', 'PhanTypeMismatchReturn', 'PhanUndeclaredClassMethod'],
        'src/class-options.php' => ['PhanPluginSimplifyExpressionBool'],
        'src/class-rest-controller.php' => ['PhanPluginDuplicateConditionalNullCoalescing'],
        'src/class-template-tags.php' => ['PhanTypeMismatchArgument', 'PhanTypeMismatchArgumentProbablyReal'],
        'src/classic-search/class-classic-search.php' => ['PhanImpossibleCondition', 'PhanPluginRedundantAssignment', 'PhanTypeInvalidDimOffset', 'PhanTypeMismatchDeclaredParamNullable', 'PhanTypeMismatchProperty', 'PhanTypeMismatchReturn', 'PhanTypePossiblyInvalidDimOffset'],
        'src/customizer/customize-controls/class-excluded-post-types-control.php' => ['PhanTypeMismatchReturnProbablyReal'],
        'src/initializers/class-initializer.php' => ['PhanNoopNew'],
        'src/instant-search/class-instant-search.php' => ['PhanTypeMismatchProperty', 'PhanTypeMismatchReturn', 'PhanTypeMismatchReturnProbablyReal'],
        'src/widgets/class-search-widget.php' => ['PhanPluginDuplicateConditionalNullCoalescing', 'PhanPossiblyUndeclaredVariable', 'PhanTypeMismatchArgument', 'PhanTypeSuspiciousEcho'],
        'src/wpes/class-query-builder.php' => ['PhanImpossibleCondition', 'PhanTypeMismatchDimAssignment', 'PhanTypeMismatchReturnProbablyReal'],
        'tests/php/Helpers_Test.php' => ['PhanPluginMixedKeyNoKey', 'PhanTypeMismatchArgument'],
        'tests/php/Plan_Test.php' => ['PhanDeprecatedFunction', 'PhanTypeMismatchArgumentProbablyReal'],
    ],
    // 'directory_suppressions' => ['src/directory_name' => ['PhanIssueName1', 'PhanIssueName2']] can be manually added if needed.
    // (directory_suppressions will currently be ignored by subsequent calls to --save-baseline, but may be preserved in future Phan releases)
];
