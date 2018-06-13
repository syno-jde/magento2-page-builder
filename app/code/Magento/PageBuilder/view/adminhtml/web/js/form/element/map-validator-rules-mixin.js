/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery'
], function ($) {
    'use strict';

    /**
     * Validate the number is between the min and max provided
     *
     * @param {Number} value
     * @param {Number} min
     * @param {Number} max
     * @return {Boolean}
     */
    function validateNumberBetween(value, min, max) {
        var numValue;

        if ($.mage.isEmptyNoTrim(value)) {
            return true;
        }

        numValue = $.mage.parseNumber(value);

        if (isNaN(numValue)) {
            return false;
        }

        return $.mage.isBetween(numValue, min, max);
    }

    return function (validator) {
        var requiredInputRuleHandler = validator.getRule('required-entry').handler;

        validator.addRule(
            'required-entry-location-name',
            requiredInputRuleHandler,
            $.mage.__('Please enter the location name.')
        );

        validator.addRule(
            'required-entry-latitude',
            requiredInputRuleHandler,
            $.mage.__('Enter latitude')
        );

        validator.addRule(
            'required-entry-longitude',
            requiredInputRuleHandler,
            $.mage.__('Enter longitude')
        );

        validator.addRule(
            'validate-latitude',
            function (value) {
                return validateNumberBetween(value, -85, 85);
            },
            $.mage.__('Please enter a number between -85 and 85')
        );

        validator.addRule(
            'validate-longitude',
            function (value) {
                return validateNumberBetween(value, -180, 180);
            },
            $.mage.__('Please enter a number between -180 and 180')
        );

        return validator;
    };
});