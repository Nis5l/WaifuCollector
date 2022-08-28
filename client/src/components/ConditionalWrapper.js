const ConditionalWrapper = ({condition, wrapper, children}) =>
    condition ? new wrapper(children) : children;

export default ConditionalWrapper;
