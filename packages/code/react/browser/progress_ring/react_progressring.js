screens.react.ProgressRing = ({ radius, stroke, strokeDasharray, progress, color, fill = "transparent", ...props }) => {
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress / 100 * circumference;
    strokeDasharray = strokeDasharray || circumference + ' ' + circumference;
    return (
        <svg
            height={radius * 2}
            width={radius * 2}
            {...props}
        >
            <circle
                stroke={color}
                fill={fill}
                strokeWidth={stroke}
                strokeDasharray={strokeDasharray}
                style={{ strokeDashoffset }}
                stroke-width={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};

screens.react.ProgressRing.Loading = ({ speed = 1000, show, style, color, strokeDasharray, radius, ...props }) => {
    const { util, ProgressRing } = screens.react;
    const object = util.useObject();
    const { nightMode, fontSize } = screens.ui.theme.options;
    radius = radius || screens.ui.basic.emToPixels(object, parseFloat(fontSize));
    const [start, stop] = util.useInterval(speed, true);
    const [progress, setProgress] = React.useState(0);
    style = style || {};
    color = color || nightMode ? "white" : "black";
    style.visibility = show ? "visible" : "hidden";
    strokeDasharray = strokeDasharray || 4;
    React.useEffect(() => {
        if (!show) {
            stop();
            return;
        }
        start(() => {
            setProgress(progress => {
                if (progress >= 100) {
                    progress = 0;
                }
                progress += 10;
                return progress;
            });
        });
    }, [show]);
    return (<ProgressRing progress={progress} strokeDasharray={strokeDasharray} color={color} radius={radius} style={style} {...props} />);
};
