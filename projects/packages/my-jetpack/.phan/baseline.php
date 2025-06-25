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
    // PhanTypeMismatchArgumentNullable : 60+ occurrences
    // PhanTypeMismatchPropertyDefault : 15+ occurrences
    // PhanAbstractStaticMethodCallInStatic : 10+ occurrences
    // PhanTypeMismatchReturnProbablyReal : 7 occurrences
    // PhanNoopNew : 6 occurrences
    // PhanPluginDuplicateConditionalNullCoalescing : 4 occurrences
    // PhanImpossibleCondition : 2 occurrences
    // PhanNonClassMethodCall : 2 occurrences
    // PhanTypeMismatchReturnNullable : 2 occurrences
    // PhanPluginMixedKeyNoKey : 1 occurrence
    // PhanTypeMismatchArgumentNullableInternal : 1 occurrence
    // PhanTypeMismatchReturn : 1 occurrence
    // PhanTypeSuspiciousNonTraversableForeach : 1 occurrence

    // Currently, file_suppressions and directory_suppressions are the only supported suppressions
    'file_suppressions' => [
        'src/class-initializer.php' => ['PhanImpossibleCondition', 'PhanNoopNew'],
        'src/class-products.php' => ['PhanNonClassMethodCall'],
        'src/class-rest-products.php' => ['PhanPluginMixedKeyNoKey'],
        'src/class-wpcom-products.php' => ['PhanTypeMismatchReturnProbablyReal'],
        'src/products/class-anti-spam.php' => ['PhanTypeMismatchArgumentNullable', 'PhanTypeMismatchPropertyDefault'],
        'src/products/class-backup.php' => ['PhanTypeMismatchArgumentNullable', 'PhanTypeMismatchPropertyDefault', 'PhanTypeSuspiciousNonTraversableForeach'],
        'src/products/class-boost.php' => ['PhanTypeMismatchPropertyDefault'],
        'src/products/class-creator.php' => ['PhanTypeMismatchPropertyDefault', 'PhanTypeMismatchReturnProbablyReal'],
        'src/products/class-crm.php' => ['PhanTypeMismatchPropertyDefault'],
        'src/products/class-extras.php' => ['PhanTypeMismatchArgumentNullable', 'PhanTypeMismatchPropertyDefault'],
        'src/products/class-hybrid-product.php' => ['PhanTypeMismatchArgumentNullable', 'PhanTypeMismatchReturnNullable'],
        'src/products/class-jetpack-ai.php' => ['PhanPluginDuplicateConditionalNullCoalescing', 'PhanTypeMismatchReturn', 'PhanTypeMismatchReturnProbablyReal'],
        'src/products/class-module-product.php' => ['PhanTypeMismatchReturnProbablyReal'],
        'src/products/class-product.php' => ['PhanAbstractStaticMethodCallInStatic', 'PhanTypeMismatchArgumentNullable', 'PhanTypeMismatchPropertyDefault'],
        'src/products/class-protect.php' => ['PhanTypeMismatchPropertyDefault'],
        'src/products/class-scan.php' => ['PhanTypeMismatchArgumentNullable'],
        'src/products/class-search.php' => ['PhanTypeMismatchArgumentNullable', 'PhanTypeMismatchPropertyDefault', 'PhanTypeMismatchReturnNullable'],
        'src/products/class-security.php' => ['PhanTypeMismatchArgumentNullable'],
        'src/products/class-social.php' => ['PhanTypeMismatchPropertyDefault'],
        'src/products/class-starter.php' => ['PhanTypeMismatchArgumentNullable'],
        'src/products/class-stats.php' => ['PhanTypeMismatchArgumentNullable', 'PhanTypeMismatchArgumentNullableInternal'],
        'src/products/class-videopress.php' => ['PhanTypeMismatchArgumentNullable', 'PhanTypeMismatchPropertyDefault'],
        'tests/php/Backup_Product_Test.php' => ['PhanTypeMismatchArgumentNullable'],
        'tests/php/Hybrid_Product_Test.php' => ['PhanTypeMismatchArgumentNullable'],
        'tests/php/Product_Multiple_Filenames_Test.php' => ['PhanTypeMismatchArgumentNullable', 'PhanTypeMismatchPropertyDefault'],
        'tests/php/Products_Test.php' => ['PhanNonClassMethodCall'],
        'tests/php/Search_Product_Test.php' => ['PhanTypeMismatchArgumentNullable'],
        'tests/php/Social_Product_Test.php' => ['PhanTypeMismatchArgumentNullable'],
        'tests/php/Videopress_Product_Test.php' => ['PhanTypeMismatchArgumentNullable'],
    ],
    // 'directory_suppressions' => ['src/directory_name' => ['PhanIssueName1', 'PhanIssueName2']] can be manually added if needed.
    // (directory_suppressions will currently be ignored by subsequent calls to --save-baseline, but may be preserved in future Phan releases)
];
