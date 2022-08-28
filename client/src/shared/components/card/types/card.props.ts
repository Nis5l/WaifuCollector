export interface CardProps {
    title?: string,
    styleClassName?: string,
    icon?: string,
    iconNum?: number,
    onIconClick?: () => void,
    onClick?: (event: any) => void,
    children: any
}
