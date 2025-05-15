import React, { useEffect, useState } from 'react';

interface ComponentArrayRendererProps {
  components?: React.ComponentType<any>[];
  finishedRenderingHook: () => void;
}

export const ComponentArrayRenderer: React.FC<ComponentArrayRendererProps> = ({
  components,
  finishedRenderingHook,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!components || components.length === 0) {
      finishedRenderingHook();
    }
  }, [components, finishedRenderingHook]);

  if (!components || components.length === 0) {
    return null;
  }

  return (
    <>
      {components.map((Component, index) => (
        <Component
          key={index}
          onNext={() =>
            activeIndex === components.length - 1
              ? finishedRenderingHook()
              : setActiveIndex(activeIndex + 1)
          }
          isShown={activeIndex === index}
        />
      ))}
    </>
  );
};