import React from 'react'
import { getLookup } from './risk-detail-helper'

describe("Risk Detail Helper", () => {
  describe("getLookup", () => {
    it("should return empty when lookup is empty", () => {
      const lookup = []
      expect(getLookup(null, lookup)).toEqual({ Name: "", Color: ""})
    })

    it("should return object matching value", () => {
      const lookup = [
        { Value: 1 },
        { Value: 2 },
        { Value: 3 },
      ]
      expect(getLookup(2, lookup)).toEqual(lookup[1])
    })
  })
})