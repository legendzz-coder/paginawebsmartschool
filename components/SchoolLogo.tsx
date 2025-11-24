
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export const SchoolLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <img
    src="img/logo.png" 
    alt="I.E.P Smart School Logo"
    className={`object-contain ${className}`}
  />
);
