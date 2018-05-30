/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import ConverterInterface from "../../../../converter/converter-interface";

export default class MarginsAndPaddings implements ConverterInterface {
    /**
     * @param {string} value
     * @returns {Object | string}
     */
    public fromDom(value: string): string | object {
        return value;
    }

    /**
     * Convert value to knockout format
     *
     * @param name string
     * @param data Object
     * @returns {string | object}
     */
    public toDom(name: string, data: object): string | object {
        let value = data[name];
        if (value && typeof value === "string") {
            value = JSON.parse(value);
        }
        const result = {};
        if (undefined !== value && undefined !== value.margin) {
            result.marginLeft = value.margin.left + "px";
            result.marginTop = value.margin.top + "px";
            result.marginRight = value.margin.right + "px";
            result.marginBottom = (value.margin.bottom !== "0" ? value.margin.bottom : 1) + "px";
        }
        if (undefined !== value && undefined !== value.padding) {
            result.paddingLeft = value.padding.left + "px";
            result.paddingTop = value.padding.top + "px";
            result.paddingRight = value.padding.right + "px";
            result.paddingBottom = value.padding.bottom + "px";
        }
        return result;
    }
}