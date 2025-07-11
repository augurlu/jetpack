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
    // PhanPluginMixedKeyNoKey : 20+ occurrences
    // PhanUndeclaredStaticMethod : 15+ occurrences
    // PhanTypeVoidAssignment : 7 occurrences
    // PhanTypeMismatchArgument : 6 occurrences
    // PhanRedundantCondition : 5 occurrences
    // PhanTypeMismatchArgumentNullable : 5 occurrences
    // PhanTypeVoidArgument : 5 occurrences
    // PhanUndeclaredConstant : 5 occurrences
    // PhanTypeSuspiciousEcho : 4 occurrences
    // PhanImpossibleCondition : 3 occurrences
    // PhanTypeArraySuspiciousNullable : 3 occurrences
    // PhanUndeclaredClassMethod : 3 occurrences
    // PhanNoopNew : 2 occurrences
    // PhanContextNotObject : 1 occurrence
    // PhanDeprecatedFunction : 1 occurrence
    // PhanDeprecatedProperty : 1 occurrence
    // PhanNoopNewNoSideEffects : 1 occurrence
    // PhanPluginRedundantAssignment : 1 occurrence
    // PhanPluginUseReturnValueInternalKnown : 1 occurrence
    // PhanPossiblyUndeclaredVariable : 1 occurrence
    // PhanTypeObjectUnsetDeclaredProperty : 1 occurrence
    // PhanUndeclaredClassConstant : 1 occurrence
    // PhanUndeclaredClassStaticProperty : 1 occurrence
    // PhanUndeclaredFunctionInCallable : 1 occurrence
    // PhanUndeclaredMethod : 1 occurrence

    // Currently, file_suppressions and directory_suppressions are the only supported suppressions
    'file_suppressions' => [
        'class-wpcomsh-cli-commands.php' => ['PhanTypeVoidAssignment'],
        'custom-colors/class-palette.php' => ['PhanTypeArraySuspiciousNullable'],
        'custom-colors/colors-api.php' => ['PhanNoopNewNoSideEffects'],
        'custom-colors/colors.php' => ['PhanTypeMismatchArgumentNullable'],
        'custom-colors/core-bg-admin-notice.php' => ['PhanContextNotObject'],
        'endpoints/class-marketplace-webhook-response.php' => ['PhanPluginMixedKeyNoKey'],
        'feature-plugins/autosave-revision.php' => ['PhanPluginRedundantAssignment', 'PhanTypeMismatchArgumentNullable'],
        'feature-plugins/coblocks-mods.php' => ['PhanUndeclaredClassConstant', 'PhanUndeclaredClassMethod'],
        'feature-plugins/managed-plugins.php' => ['PhanUndeclaredClassMethod', 'PhanUndeclaredFunctionInCallable'],
        'feature-plugins/sensei-pro-mods.php' => ['PhanUndeclaredClassMethod'],
        'footer-credit/theme-optimizations.php' => ['PhanUndeclaredConstant', 'PhanUndeclaredStaticMethod'],
        'functions.php' => ['PhanImpossibleCondition', 'PhanUndeclaredClassStaticProperty'],
        'imports/playground/class-sql-importer.php' => ['PhanUndeclaredConstant'],
        'notices/plan-notices.php' => ['PhanImpossibleCondition'],
        'private-site/access-denied-coming-soon-template.php' => ['PhanTypeSuspiciousEcho'],
        'private-site/access-denied-preview-login-template.php' => ['PhanTypeSuspiciousEcho'],
        'private-site/access-denied-private-site-template.php' => ['PhanTypeSuspiciousEcho'],
        'safeguard/utils.php' => ['PhanPossiblyUndeclaredVariable', 'PhanTypeMismatchArgument'],
        'support-session.php' => ['PhanNoopNew'],
        'tests/AnyoneCanRegisterNoticeTest.php' => ['PhanTypeMismatchArgument', 'PhanTypeVoidArgument', 'PhanTypeVoidAssignment'],
        'tests/BlogTokenResilienceTest.php' => ['PhanUndeclaredStaticMethod'],
        'tests/FrontendNoticesTest.php' => ['PhanUndeclaredStaticMethod'],
        'tests/PlanNoticesTest.php' => ['PhanDeprecatedProperty', 'PhanPluginUseReturnValueInternalKnown', 'PhanUndeclaredStaticMethod'],
        'tests/WpcomFeaturesTest.php' => ['PhanTypeMismatchArgument', 'PhanUndeclaredStaticMethod'],
        'tests/feature-manager/FeatureHookTest.php' => ['PhanUndeclaredStaticMethod'],
        'tests/imports/SQLGeneratorTest.php' => ['PhanTypeObjectUnsetDeclaredProperty'],
        'widgets/class-jetpack-posts-i-like-widget.php' => ['PhanRedundantCondition'],
        'widgets/class-pd-top-rated.php' => ['PhanRedundantCondition'],
        'widgets/class-widget-top-clicks.php' => ['PhanDeprecatedFunction'],
        'wpcom-features/class-wpcom-features.php' => ['PhanPluginMixedKeyNoKey'],
        'wpcom-features/functions-wpcom-features.php' => ['PhanImpossibleCondition', 'PhanTypeMismatchArgument', 'PhanUndeclaredMethod'],
    ],
    // 'directory_suppressions' => ['src/directory_name' => ['PhanIssueName1', 'PhanIssueName2']] can be manually added if needed.
    // (directory_suppressions will currently be ignored by subsequent calls to --save-baseline, but may be preserved in future Phan releases)
];
