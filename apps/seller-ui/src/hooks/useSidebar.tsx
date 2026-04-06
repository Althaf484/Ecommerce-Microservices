"use client";

import React, { useState } from 'react'

const useSidebar = () => {
    const [activeSidebar, setActiveSidebar] = useState();
    return {activeSidebar, setActiveSidebar}
}

export default useSidebar;
