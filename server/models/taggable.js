/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

let _ = require('lodash');

module.exports = function (cls) {

  cls.prototype.getTag = function (key) {
    let tag = _.find(this.Tags, { Key: key });
    if (tag === undefined) {
      throw new Error(`Can't find tag`)
    }
    return tag.Value;
  }

  cls.prototype.setTag = function (key, value) {
    let tag = this.getTag(key);
    if (tag === undefined) {
      tag = {
        Key: key,
        Value: value,
      };
      this.Tags.push(tag);
    } else {
      tag.Value = value;
    }
  }

};