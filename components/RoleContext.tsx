'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'SPV' | 'Admin' | 'Desainer' | 'Marketing';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  roles: Role[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('SPV');
  const roles: Role[] = ['SPV', 'Admin', 'Desainer', 'Marketing'];

  return (
    <RoleContext.Provider value={{ role, setRole, roles }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
