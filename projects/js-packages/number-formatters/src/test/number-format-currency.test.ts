import { describe, expect, it } from '@jest/globals';
import { numberFormatCurrency, getCurrencyObject } from '../number-format-currency/index.ts';

const browserSafeLocale = 'en-US';

describe( 'numberFormatCurrency() default export', () => {
	it( 'formats a number to localized currency', () => {
		const money = numberFormatCurrency( {
			number: 99.32,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$99.32' );
	} );
} );

describe( 'getCurrencyObject() default export', () => {
	it( 'handles negative values', () => {
		const money = getCurrencyObject( {
			number: -1234.56789,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '1,234',
			fraction: '.57',
			sign: '-',
			hasNonZeroFraction: true,
		} );
	} );
} );

describe( 'numberFormatCurrency()', () => {
	it( 'formats a number to localized currency', () => {
		const money = numberFormatCurrency( {
			number: 99.32,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$99.32' );
	} );

	it( 'adds a localized thousands separator', () => {
		const money = numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale,
		} );

		expect( money ).toBe( '$9,800,900.32' );
	} );

	it( 'handles zero', () => {
		const money = numberFormatCurrency( {
			number: 0,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$0.00' );

		const money2 = numberFormatCurrency( {
			number: 0,
			currency: 'USD',
			browserSafeLocale,
			stripZeros: true,
		} );
		expect( money2 ).toBe( '$0' );

		const money3 = numberFormatCurrency( {
			number: 0,
			currency: 'EUR',
			browserSafeLocale,
		} );
		expect( money3 ).toBe( '€0.00' );

		const money4 = numberFormatCurrency( {
			number: 0,
			currency: 'EUR',
			browserSafeLocale,
			stripZeros: true,
		} );
		expect( money4 ).toBe( '€0' );
	} );

	it( 'handles negative values', () => {
		const money = numberFormatCurrency( {
			number: -1234.56789,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '-$1,234.57' );
	} );

	it( 'unknown currency codes return default', () => {
		const money = numberFormatCurrency( {
			number: 9800900.32,
			currency: '',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	it( 'unknown locale codes return default', () => {
		const money = numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'foo-bar',
		} );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	it( 'formats a number to localized currency for smallest unit', () => {
		const money = numberFormatCurrency( {
			number: 9932,
			currency: 'USD',
			browserSafeLocale,
			isSmallestUnit: true,
		} );
		expect( money ).toBe( '$99.32' );
	} );

	it( 'formats a number to localized currency for smallest unit for non-decimal currency', () => {
		const money = numberFormatCurrency( {
			number: 9932,
			currency: 'JPY',
			browserSafeLocale,
			isSmallestUnit: true,
		} );
		expect( money ).toBe( '¥9,932' );
	} );

	it( 'formats a rounded number if the number is a float and smallest unit is true', () => {
		const money = numberFormatCurrency( {
			number: 9932.1,
			currency: 'USD',
			browserSafeLocale,
			isSmallestUnit: true,
		} );
		expect( money ).toBe( '$99.32' );
	} );

	it( 'returns no trailing zero cents when stripZeros set to true (USD)', () => {
		const money = numberFormatCurrency( {
			number: 9800900,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$9,800,900.00' );

		// Trailing zero cents should be removed.
		const money2 = numberFormatCurrency( {
			number: 9800900,
			currency: 'USD',
			browserSafeLocale,
			stripZeros: true,
		} );
		expect( money2 ).toBe( '$9,800,900' );

		// It should not strip non-zero cents.
		const money3 = numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale,
			stripZeros: true,
		} );
		expect( money3 ).toBe( '$9,800,900.32' );
	} );

	it( 'returns no trailing zero cents when stripZeros set to true (EUR)', () => {
		const money = numberFormatCurrency( {
			number: 9800900,
			currency: 'EUR',
			browserSafeLocale: 'de-DE',
		} );
		expect( money ).toBe( '9.800.900,00 €' );

		// Trailing zero cents should be removed.
		const money2 = numberFormatCurrency( {
			number: 9800900,
			currency: 'EUR',
			browserSafeLocale: 'de-DE',
			stripZeros: true,
		} );
		expect( money2 ).toBe( '9.800.900 €' );

		// It should not strip non-zero cents.
		const money3 = numberFormatCurrency( {
			number: 9800900.32,
			currency: 'EUR',
			browserSafeLocale: 'de-DE',
			stripZeros: true,
		} );
		expect( money3 ).toBe( '9.800.900,32 €' );
	} );

	it( 'returns a plus sign for positive numbers if signForPositive is true (USD)', () => {
		const money = numberFormatCurrency( {
			number: 9800900,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '$9,800,900.00' );

		const money2 = numberFormatCurrency( {
			number: 9800900,
			currency: 'USD',
			browserSafeLocale,
			signForPositive: true,
		} );
		expect( money2 ).toBe( '+$9,800,900.00' );
	} );

	it( 'returns a negative sign for negative numbers if signForPositive is true (USD)', () => {
		const money = numberFormatCurrency( {
			number: -9800900,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toBe( '-$9,800,900.00' );

		const money2 = numberFormatCurrency( {
			number: -9800900,
			currency: 'USD',
			browserSafeLocale,
			signForPositive: true,
		} );
		expect( money2 ).toBe( '-$9,800,900.00' );
	} );

	it( 'returns a plus sign for positive numbers if signForPositive is true (EUR)', () => {
		const money = numberFormatCurrency( {
			number: 9800900,
			currency: 'EUR',
			browserSafeLocale: 'de-DE',
		} );
		expect( money ).toBe( '9.800.900,00 €' );

		const money2 = numberFormatCurrency( {
			number: 9800900,
			currency: 'EUR',
			browserSafeLocale: 'de-DE',
			signForPositive: true,
		} );
		expect( money2 ).toBe( '+9.800.900,00 €' );
	} );

	it( 'returns a number in latin numbers even for locales which default to other character sets', () => {
		const money = numberFormatCurrency( {
			number: 9800900,
			currency: 'INR',
			browserSafeLocale: 'mr-IN',
		} );
		expect( money ).toBe( '₹9,800,900.00' );
	} );

	it( 'sets USD currency symbol to $ if geolocation is US and locale is en', async () => {
		const money = numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'en-US',
			geoLocation: 'US',
		} );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	it( 'sets USD currency symbol to US$ if geolocation is US but locale is not en', async () => {
		const money = numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'fr',
			geoLocation: 'US',
		} );
		expect( money ).toBe( '9 800 900,32 $US' );
	} );

	it( 'sets USD currency symbol to US$ if geolocation is US but locale is an en variant', async () => {
		const money = numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'en-CA',
			geoLocation: 'US',
		} );
		expect( money ).toBe( 'US$9,800,900.32' );
	} );

	it( 'does not change USD currency symbol from $ if geolocation is unknown and locale is en', async () => {
		const money = numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'en',
			geoLocation: '',
		} );
		expect( money ).toBe( '$9,800,900.32' );
	} );

	it( 'sets USD currency symbol to US$ if geolocation is not US and locale is en', async () => {
		const money = numberFormatCurrency( {
			number: 9800900.32,
			currency: 'USD',
			browserSafeLocale: 'en',
			geoLocation: 'CA',
		} );
		expect( money ).toBe( 'US$9,800,900.32' );
	} );

	describe( 'specific currencies', () => {
		it( 'USD', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'USD',
				browserSafeLocale,
			} );
			expect( money ).toBe( '$9,800,900.32' );
		} );
		it( 'USD in Canadian English', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'USD',
				browserSafeLocale: 'en-CA',
			} );
			expect( money ).toBe( 'US$9,800,900.32' );
		} );
		it( 'AUD', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'AUD',
				browserSafeLocale,
			} );
			expect( money ).toBe( 'A$9,800,900.32' );
		} );
		it( 'CAD in Canadian English', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'CAD',
				browserSafeLocale: 'en-CA',
			} );
			expect( money ).toBe( 'C$9,800,900.32' );
		} );
		it( 'CAD in US English', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'CAD',
				browserSafeLocale: 'en-US',
			} );
			expect( money ).toBe( 'C$9,800,900.32' );
		} );
		it( 'CAD in Canadian French', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'CAD',
				browserSafeLocale: 'fr-CA',
			} );
			expect( money ).toBe( '9 800 900,32 C$' );
		} );
		it( 'EUR in EN locale', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'EUR',
				browserSafeLocale: 'en-US',
			} );
			expect( money ).toBe( '€9,800,900.32' );
		} );
		it( 'EUR in DE locale', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'EUR',
				browserSafeLocale: 'de-DE',
			} );
			expect( money ).toBe( '9.800.900,32 €' );
		} );
		it( 'EUR in FR locale', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'EUR',
				browserSafeLocale: 'fr-FR',
			} );
			expect( money ).toBe( '9 800 900,32 €' );
		} );
		it( 'GBP', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'GBP',
				browserSafeLocale,
			} );
			expect( money ).toBe( '£9,800,900.32' );
		} );
		it( 'JPY', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'JPY',
				browserSafeLocale,
			} );
			expect( money ).toBe( '¥9,800,900' );
		} );
		it( 'BRL in EN locale', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'BRL',
				browserSafeLocale,
			} );
			expect( money ).toBe( 'R$9,800,900.32' );
		} );
		it( 'BRL in PT locale', () => {
			const money = numberFormatCurrency( {
				number: 9800900.32,
				currency: 'BRL',
				browserSafeLocale: 'pt-BR',
			} );
			expect( money ).toBe( 'R$ 9.800.900,32' );
		} );
		it( 'IDR', () => {
			const money = numberFormatCurrency( {
				number: 107280000,
				currency: 'IDR',
				browserSafeLocale: 'in-ID',
				isSmallestUnit: true,
			} );
			expect( money ).toBe( 'Rp 1.072.800,00' );
		} );
	} );
} );

describe( 'getCurrencyObject()', () => {
	it( 'handles zero', () => {
		const money = getCurrencyObject( {
			number: 0,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '0',
			fraction: '.00',
			sign: '',
			hasNonZeroFraction: false,
		} );
	} );

	it( 'handles negative values', () => {
		const money = getCurrencyObject( {
			number: -1234.56789,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '1,234',
			fraction: '.57',
			sign: '-',
			hasNonZeroFraction: true,
		} );
	} );

	it( 'handles values that round up', () => {
		const money = getCurrencyObject( {
			number: 9.99876,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '10',
			fraction: '.00',
			sign: '',
			hasNonZeroFraction: false,
		} );
	} );

	it( 'handles values that round down', () => {
		const money = getCurrencyObject( {
			number: 9.99432,
			currency: 'USD',
			browserSafeLocale,
		} );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '9',
			fraction: '.99',
			sign: '',
			hasNonZeroFraction: true,
		} );
	} );

	it( 'handles a number in the smallest unit', () => {
		const money = getCurrencyObject( {
			number: 9932,
			currency: 'USD',
			browserSafeLocale,
			isSmallestUnit: true,
		} );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '99',
			fraction: '.32',
			sign: '',
			hasNonZeroFraction: true,
		} );
	} );

	it( 'handles a number in the smallest unit for non-decimal currency', () => {
		const money = getCurrencyObject( {
			number: 9932,
			currency: 'JPY',
			browserSafeLocale,
			isSmallestUnit: true,
		} );
		expect( money ).toEqual( {
			symbol: '¥',
			symbolPosition: 'before',
			integer: '9,932',
			fraction: '',
			sign: '',
			hasNonZeroFraction: false,
		} );
	} );

	it( 'handles the number as rounded if the number is a float and smallest unit is set', () => {
		const money = getCurrencyObject( {
			number: 9932.1,
			currency: 'USD',
			browserSafeLocale,
			isSmallestUnit: true,
		} );
		expect( money ).toEqual( {
			symbol: '$',
			symbolPosition: 'before',
			integer: '99',
			fraction: '.32',
			sign: '',
			hasNonZeroFraction: true,
		} );
	} );

	describe( 'specific currencies', () => {
		it( 'USD', () => {
			const money = getCurrencyObject( {
				number: 9800900.32,
				currency: 'USD',
				browserSafeLocale,
			} );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		it( 'USD with signForPositive set', () => {
			const money = getCurrencyObject( {
				number: 9800900.32,
				currency: 'USD',
				browserSafeLocale,
				signForPositive: true,
			} );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '+',
				hasNonZeroFraction: true,
			} );
		} );

		it( 'USD with signForPositive set and negative number', () => {
			const money = getCurrencyObject( {
				number: -9800900.32,
				currency: 'USD',
				browserSafeLocale,
				signForPositive: true,
			} );
			expect( money ).toEqual( {
				symbol: '$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '-',
				hasNonZeroFraction: true,
			} );
		} );

		it( 'USD in Canadian English', () => {
			const money = getCurrencyObject( {
				number: 9800900.32,
				currency: 'USD',
				browserSafeLocale: 'en-CA',
			} );
			expect( money ).toEqual( {
				symbol: 'US$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		it( 'AUD', () => {
			const money = getCurrencyObject( {
				number: 9800900.32,
				currency: 'AUD',
				browserSafeLocale,
			} );
			expect( money ).toEqual( {
				symbol: 'A$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		it( 'CAD', () => {
			const money = getCurrencyObject( {
				number: 9800900.32,
				currency: 'CAD',
				browserSafeLocale,
			} );
			expect( money ).toEqual( {
				symbol: 'C$',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		it( 'EUR', () => {
			const money = getCurrencyObject( {
				number: 9800900.32,
				currency: 'EUR',
				browserSafeLocale: 'de-DE',
			} );
			expect( money ).toEqual( {
				symbol: '€',
				symbolPosition: 'after',
				integer: '9.800.900',
				fraction: ',32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		it( 'GBP', () => {
			const money = getCurrencyObject( {
				number: 9800900.32,
				currency: 'GBP',
				browserSafeLocale,
			} );
			expect( money ).toEqual( {
				symbol: '£',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '.32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );

		it( 'JPY', () => {
			const money = getCurrencyObject( {
				number: 9800900.32,
				currency: 'JPY',
				browserSafeLocale,
			} );
			expect( money ).toEqual( {
				symbol: '¥',
				symbolPosition: 'before',
				integer: '9,800,900',
				fraction: '',
				sign: '',
				hasNonZeroFraction: false,
			} );
		} );

		it( 'BRL', () => {
			const money = getCurrencyObject( {
				number: 9800900.32,
				currency: 'BRL',
				browserSafeLocale: 'pt-BR',
			} );
			expect( money ).toEqual( {
				symbol: 'R$',
				symbolPosition: 'before',
				integer: '9.800.900',
				fraction: ',32',
				sign: '',
				hasNonZeroFraction: true,
			} );
		} );
	} );
} );
